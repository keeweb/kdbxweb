import { gzipSync, gunzipSync } from 'fflate';
import { Kdbx } from './kdbx';
import { CipherId, CompressionAlgorithm, ErrorCodes } from '../defs/consts';
import { KdbxError } from '../errors/kdbx-error';
import { BinaryStream } from '../utils/binary-stream';
import { KdbxContext } from './kdbx-context';
import { KdbxHeader } from './kdbx-header';
import {
    arrayBufferEquals,
    arrayToBuffer,
    bytesToString,
    stringToBytes,
    zeroBuffer
} from '../utils/byte-utils';
import { ProtectSaltGenerator } from '../crypto/protect-salt-generator';
import * as XmlUtils from '../utils/xml-utils';
import * as HmacBlockTransform from '../crypto/hmac-block-transform';
import * as HashedBlockTransform from '../crypto/hashed-block-transform';
import * as CryptoEngine from '../crypto/crypto-engine';
import * as KeyEncryptorAes from '../crypto/key-encryptor-aes';
import * as KeyEncryptorKdf from '../crypto/key-encryptor-kdf';
import { Int64 } from '../utils/int64';

export class KdbxFormat {
    readonly kdbx: Kdbx;
    readonly ctx: KdbxContext;

    preserveXml = false;

    constructor(kdbx: Kdbx) {
        this.kdbx = kdbx;
        this.ctx = new KdbxContext({ kdbx });
    }

    load(data: ArrayBuffer): Promise<Kdbx> {
        const stm = new BinaryStream(data);
        return this.kdbx.credentials.ready.then(() => {
            this.kdbx.header = KdbxHeader.read(stm, this.ctx);
            if (this.kdbx.header.versionMajor === 3) {
                return this.loadV3(stm);
            } else if (this.kdbx.header.versionMajor === 4) {
                return this.loadV4(stm);
            } else {
                throw new KdbxError(
                    ErrorCodes.InvalidVersion,
                    `bad version: ${this.kdbx.versionMajor}`
                );
            }
        });
    }

    private loadV3(stm: BinaryStream): Promise<Kdbx> {
        return this.decryptXmlV3(stm).then((xmlStr) => {
            this.kdbx.xml = XmlUtils.parse(xmlStr);
            return this.setProtectedValues().then(() => {
                return this.kdbx.loadFromXml(this.ctx).then(() => {
                    return this.checkHeaderHashV3(stm).then(() => {
                        this.cleanXml();
                        return this.kdbx;
                    });
                });
            });
        });
    }

    private loadV4(stm: BinaryStream): Promise<Kdbx> {
        return this.getHeaderHash(stm).then((headerSha) => {
            const expectedHeaderSha = stm.readBytes(headerSha.byteLength);
            if (!arrayBufferEquals(expectedHeaderSha, headerSha)) {
                throw new KdbxError(ErrorCodes.FileCorrupt, 'header hash mismatch');
            }
            return this.computeKeysV4().then((keys) => {
                return this.getHeaderHmac(stm, keys.hmacKey).then((headerHmac) => {
                    const expectedHeaderHmac = stm.readBytes(headerHmac.byteLength);
                    if (!arrayBufferEquals(expectedHeaderHmac, headerHmac)) {
                        throw new KdbxError(ErrorCodes.InvalidKey);
                    }
                    return HmacBlockTransform.decrypt(stm.readBytesToEnd(), keys.hmacKey).then(
                        (data) => {
                            zeroBuffer(keys.hmacKey);
                            return this.decryptData(data, keys.cipherKey).then((data) => {
                                zeroBuffer(keys.cipherKey);
                                if (this.kdbx.header.compression === CompressionAlgorithm.GZip) {
                                    data = arrayToBuffer(gunzipSync(new Uint8Array(data)));
                                }
                                stm = new BinaryStream(arrayToBuffer(data));
                                this.kdbx.header.readInnerHeader(stm, this.ctx);
                                data = stm.readBytesToEnd();
                                const xmlStr = bytesToString(data);
                                this.kdbx.xml = XmlUtils.parse(xmlStr);
                                return this.setProtectedValues().then(() => {
                                    return this.kdbx.loadFromXml(this.ctx).then((kdbx) => {
                                        this.cleanXml();
                                        return kdbx;
                                    });
                                });
                            });
                        }
                    );
                });
            });
        });
    }

    loadXml(xmlStr: string): Promise<Kdbx> {
        return this.kdbx.credentials.ready.then(() => {
            this.kdbx.header = KdbxHeader.create();
            this.kdbx.xml = XmlUtils.parse(xmlStr);
            XmlUtils.protectPlainValues(this.kdbx.xml.documentElement);
            return this.kdbx.loadFromXml(this.ctx).then(() => {
                this.cleanXml();
                return this.kdbx;
            });
        });
    }

    save(): Promise<ArrayBuffer> {
        return this.kdbx.credentials.ready.then(() => {
            const stm = new BinaryStream();
            this.kdbx.header.generateSalts();
            this.kdbx.header.write(stm);
            if (this.kdbx.versionMajor === 3) {
                return this.saveV3(stm);
            } else if (this.kdbx.versionMajor === 4) {
                return this.saveV4(stm);
            } else {
                throw new KdbxError(
                    ErrorCodes.InvalidVersion,
                    `bad version: ${this.kdbx.versionMajor}`
                );
            }
        });
    }

    private saveV3(stm: BinaryStream): Promise<ArrayBuffer> {
        return this.getHeaderHash(stm).then((headerHash) => {
            this.kdbx.meta.headerHash = headerHash;
            this.kdbx.buildXml(this.ctx);
            return this.getProtectSaltGenerator().then((gen) => {
                if (!this.kdbx.xml) {
                    throw new KdbxError(ErrorCodes.InvalidState, 'no xml');
                }
                XmlUtils.updateProtectedValuesSalt(this.kdbx.xml.documentElement, gen);
                return this.encryptXmlV3().then((data) => {
                    this.cleanXml();
                    stm.writeBytes(data);
                    return stm.getWrittenBytes();
                });
            });
        });
    }

    private saveV4(stm: BinaryStream): Promise<ArrayBuffer> {
        this.kdbx.buildXml(this.ctx);
        return this.getHeaderHash(stm).then((headerSha) => {
            stm.writeBytes(headerSha);
            return this.computeKeysV4().then((keys) => {
                return this.getHeaderHmac(stm, keys.hmacKey).then((headerHmac) => {
                    stm.writeBytes(headerHmac);
                    return this.getProtectSaltGenerator().then((gen) => {
                        if (!this.kdbx.xml) {
                            throw new KdbxError(ErrorCodes.InvalidState, 'no xml');
                        }
                        XmlUtils.updateProtectedValuesSalt(this.kdbx.xml.documentElement, gen);
                        const xml = XmlUtils.serialize(this.kdbx.xml);
                        const innerHeaderStm = new BinaryStream();
                        this.kdbx.header.writeInnerHeader(innerHeaderStm, this.ctx);
                        const innerHeaderData = innerHeaderStm.getWrittenBytes();
                        const xmlData = arrayToBuffer(stringToBytes(xml));
                        let data = new ArrayBuffer(innerHeaderData.byteLength + xmlData.byteLength);
                        const dataArr = new Uint8Array(data);
                        dataArr.set(new Uint8Array(innerHeaderData));
                        dataArr.set(new Uint8Array(xmlData), innerHeaderData.byteLength);
                        zeroBuffer(xmlData);
                        zeroBuffer(innerHeaderData);
                        if (this.kdbx.header.compression === CompressionAlgorithm.GZip) {
                            data = arrayToBuffer(gzipSync(new Uint8Array(data)));
                        }
                        return this.encryptData(arrayToBuffer(data), keys.cipherKey).then(
                            (data) => {
                                zeroBuffer(keys.cipherKey);
                                return HmacBlockTransform.encrypt(data, keys.hmacKey).then(
                                    (data) => {
                                        this.cleanXml();
                                        zeroBuffer(keys.hmacKey);
                                        stm.writeBytes(data);
                                        return stm.getWrittenBytes();
                                    }
                                );
                            }
                        );
                    });
                });
            });
        });
    }

    saveXml(prettyPrint = false): Promise<string> {
        return this.kdbx.credentials.ready.then(() => {
            this.kdbx.header.generateSalts();
            this.ctx.exportXml = true;
            this.kdbx.buildXml(this.ctx);
            if (!this.kdbx.xml) {
                throw new KdbxError(ErrorCodes.InvalidState, 'no xml');
            }
            XmlUtils.unprotectValues(this.kdbx.xml.documentElement);
            const xml = XmlUtils.serialize(this.kdbx.xml, prettyPrint);
            XmlUtils.protectUnprotectedValues(this.kdbx.xml.documentElement);
            this.cleanXml();
            return xml;
        });
    }

    private decryptXmlV3(stm: BinaryStream): Promise<string> {
        const data = stm.readBytesToEnd();
        return this.getMasterKeyV3().then((masterKey) => {
            return this.decryptData(data, masterKey).then((data) => {
                zeroBuffer(masterKey);
                data = this.trimStartBytesV3(data);
                return HashedBlockTransform.decrypt(data).then((data) => {
                    if (this.kdbx.header.compression === CompressionAlgorithm.GZip) {
                        data = arrayToBuffer(gunzipSync(new Uint8Array(data)));
                    }
                    return bytesToString(data);
                });
            });
        });
    }

    private encryptXmlV3(): Promise<ArrayBuffer> {
        if (!this.kdbx.xml) {
            throw new KdbxError(ErrorCodes.InvalidState, 'no xml');
        }
        const xml = XmlUtils.serialize(this.kdbx.xml);
        let data = arrayToBuffer(stringToBytes(xml));
        if (this.kdbx.header.compression === CompressionAlgorithm.GZip) {
            data = arrayToBuffer(gzipSync(new Uint8Array(data)));
        }
        return HashedBlockTransform.encrypt(arrayToBuffer(data)).then((data) => {
            if (!this.kdbx.header.streamStartBytes) {
                throw new KdbxError(ErrorCodes.InvalidState, 'no header start bytes');
            }
            const ssb = new Uint8Array(this.kdbx.header.streamStartBytes);
            const newData = new Uint8Array(data.byteLength + ssb.length);
            newData.set(ssb);
            newData.set(new Uint8Array(data), ssb.length);
            data = newData;
            return this.getMasterKeyV3().then((masterKey) => {
                return this.encryptData(arrayToBuffer(data), masterKey).then((data) => {
                    zeroBuffer(masterKey);
                    return data;
                });
            });
        });
    }

    private getMasterKeyV3(): Promise<ArrayBuffer> {
        return this.kdbx.credentials.getHash().then((credHash) => {
            if (
                !this.kdbx.header.transformSeed ||
                !this.kdbx.header.keyEncryptionRounds ||
                !this.kdbx.header.masterSeed
            ) {
                throw new KdbxError(ErrorCodes.FileCorrupt, 'no header transform parameters');
            }
            const transformSeed = this.kdbx.header.transformSeed;
            const transformRounds = this.kdbx.header.keyEncryptionRounds;
            const masterSeed = this.kdbx.header.masterSeed;

            return this.kdbx.credentials.getChallengeResponse(masterSeed).then((chalResp) => {
                return KeyEncryptorAes.encrypt(
                    new Uint8Array(credHash),
                    transformSeed,
                    transformRounds
                ).then((encKey) => {
                    zeroBuffer(credHash);
                    return CryptoEngine.sha256(encKey).then((keyHash) => {
                        zeroBuffer(encKey);

                        const chalRespLength = chalResp ? chalResp.byteLength : 0;
                        const all = new Uint8Array(
                            masterSeed.byteLength + keyHash.byteLength + chalRespLength
                        );
                        all.set(new Uint8Array(masterSeed), 0);
                        if (chalResp) {
                            all.set(new Uint8Array(chalResp), masterSeed.byteLength);
                        }
                        all.set(new Uint8Array(keyHash), masterSeed.byteLength + chalRespLength);

                        zeroBuffer(keyHash);
                        zeroBuffer(masterSeed);
                        if (chalResp) {
                            zeroBuffer(chalResp);
                        }

                        return CryptoEngine.sha256(all.buffer).then((masterKey) => {
                            zeroBuffer(all.buffer);
                            return masterKey;
                        });
                    });
                });
            });
        });
    }

    private trimStartBytesV3(data: ArrayBuffer): ArrayBuffer {
        if (!this.kdbx.header.streamStartBytes) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no stream start bytes');
        }
        const ssb = this.kdbx.header.streamStartBytes;
        if (data.byteLength < ssb.byteLength) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'short start bytes');
        }
        if (!arrayBufferEquals(data.slice(0, this.kdbx.header.streamStartBytes.byteLength), ssb)) {
            throw new KdbxError(ErrorCodes.InvalidKey);
        }
        return data.slice(ssb.byteLength);
    }

    private setProtectedValues(): Promise<void> {
        return this.getProtectSaltGenerator().then((gen) => {
            if (!this.kdbx.xml) {
                throw new KdbxError(ErrorCodes.InvalidState, 'no xml');
            }
            XmlUtils.setProtectedValues(this.kdbx.xml.documentElement, gen);
        });
    }

    private getProtectSaltGenerator(): Promise<ProtectSaltGenerator> {
        if (!this.kdbx.header.protectedStreamKey || !this.kdbx.header.crsAlgorithm) {
            throw new KdbxError(ErrorCodes.InvalidState, 'bad header parameters');
        }
        return ProtectSaltGenerator.create(
            this.kdbx.header.protectedStreamKey,
            this.kdbx.header.crsAlgorithm
        );
    }

    private getHeaderHash(stm: BinaryStream): Promise<ArrayBuffer> {
        if (!this.kdbx.header.endPos) {
            throw new KdbxError(ErrorCodes.InvalidState, 'no end pos');
        }
        const src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
        return CryptoEngine.sha256(src);
    }

    private getHeaderHmac(stm: BinaryStream, key: ArrayBuffer): Promise<ArrayBuffer> {
        if (!this.kdbx.header.endPos) {
            throw new KdbxError(ErrorCodes.InvalidState, 'no end pos');
        }
        const src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
        return HmacBlockTransform.getHmacKey(key, new Int64(0xffffffff, 0xffffffff)).then(
            (keySha) => {
                return CryptoEngine.hmacSha256(keySha, src);
            }
        );
    }

    private checkHeaderHashV3(stm: BinaryStream) {
        if (this.kdbx.meta.headerHash) {
            const metaHash = this.kdbx.meta.headerHash;
            return this.getHeaderHash(stm).then((actualHash) => {
                if (!arrayBufferEquals(metaHash, actualHash)) {
                    throw new KdbxError(ErrorCodes.FileCorrupt, 'header hash mismatch');
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    private computeKeysV4() {
        const masterSeed = this.kdbx.header.masterSeed;
        if (!masterSeed || masterSeed.byteLength !== 32) {
            return Promise.reject(new KdbxError(ErrorCodes.FileCorrupt, 'bad master seed'));
        }
        const kdfParams = this.kdbx.header.kdfParameters;
        if (!kdfParams) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no kdf params');
        }
        const kdfSalt = kdfParams.get('S');
        if (!(kdfSalt instanceof ArrayBuffer)) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no salt');
        }
        return this.kdbx.credentials.getHash(kdfSalt).then((credHash) => {
            return KeyEncryptorKdf.encrypt(credHash, kdfParams).then((encKey) => {
                zeroBuffer(credHash);
                if (!encKey || encKey.byteLength !== 32) {
                    return Promise.reject(new KdbxError(ErrorCodes.Unsupported, 'bad derived key'));
                }
                const keyWithSeed = new Uint8Array(65);
                keyWithSeed.set(new Uint8Array(masterSeed), 0);
                keyWithSeed.set(new Uint8Array(encKey), masterSeed.byteLength);
                keyWithSeed[64] = 1;
                zeroBuffer(encKey);
                zeroBuffer(masterSeed);
                return Promise.all([
                    CryptoEngine.sha256(keyWithSeed.buffer.slice(0, 64)),
                    CryptoEngine.sha512(keyWithSeed.buffer)
                ]).then((keys) => {
                    zeroBuffer(keyWithSeed);
                    return { cipherKey: keys[0], hmacKey: keys[1] };
                });
            });
        });
    }

    private decryptData(data: ArrayBuffer, cipherKey: ArrayBuffer): Promise<ArrayBuffer> {
        const cipherId = this.kdbx.header.dataCipherUuid;
        if (!cipherId) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no cipher id');
        }
        switch (cipherId.toString()) {
            case CipherId.Aes:
                return this.transformDataV4Aes(data, cipherKey, false);
            case CipherId.ChaCha20:
                return this.transformDataV4ChaCha20(data, cipherKey);
            default:
                return Promise.reject(new KdbxError(ErrorCodes.Unsupported, 'unsupported cipher'));
        }
    }

    private encryptData(data: ArrayBuffer, cipherKey: ArrayBuffer): Promise<ArrayBuffer> {
        const cipherId = this.kdbx.header.dataCipherUuid;
        if (!cipherId) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no cipher id');
        }
        switch (cipherId.toString()) {
            case CipherId.Aes:
                return this.transformDataV4Aes(data, cipherKey, true);
            case CipherId.ChaCha20:
                return this.transformDataV4ChaCha20(data, cipherKey);
            default:
                return Promise.reject(new KdbxError(ErrorCodes.Unsupported, 'unsupported cipher'));
        }
    }

    private transformDataV4Aes(
        data: ArrayBuffer,
        cipherKey: ArrayBuffer,
        encrypt: boolean
    ): Promise<ArrayBuffer> {
        const aesCbc = CryptoEngine.createAesCbc();
        const iv = this.kdbx.header.encryptionIV;
        if (!iv) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no encryption IV');
        }
        return aesCbc.importKey(cipherKey).then(() => {
            return encrypt ? aesCbc.encrypt(data, iv) : aesCbc.decrypt(data, iv);
        });
    }

    private transformDataV4ChaCha20(
        data: ArrayBuffer,
        cipherKey: ArrayBuffer
    ): Promise<ArrayBuffer> {
        const iv = this.kdbx.header.encryptionIV;
        if (!iv) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no encryption IV');
        }
        return CryptoEngine.chacha20(data, cipherKey, iv);
    }

    private cleanXml() {
        if (!this.preserveXml) {
            this.kdbx.xml = undefined;
        }
    }
}
