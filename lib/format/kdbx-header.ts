/* Docs for the KDBX header schema:
 * https://keepass.info/help/kb/kdbx_4.html#innerhdr
 */

import {
    CipherId,
    CompressionAlgorithm,
    CrsAlgorithm,
    Defaults,
    ErrorCodes,
    KdfId,
    Signatures
} from '../defs/consts';
import { KdbxUuid } from './kdbx-uuid';
import { ValueType, VarDictionary } from '../utils/var-dictionary';
import { BinaryStream } from '../utils/binary-stream';
import { KdbxError } from '../errors/kdbx-error';
import { base64ToBytes, zeroBuffer } from '../utils/byte-utils';
import * as CryptoEngine from '../crypto/crypto-engine';
import { Int64 } from '../utils/int64';
import { KdbxContext } from './kdbx-context';
import { ProtectedValue } from '../crypto/protected-value';

interface HeaderField {
    name: string;
    ver?: number[];
    skipHeader?: boolean;
}

const HeaderFields: HeaderField[] = [
    { name: 'EndOfHeader' },

    { name: 'Comment' },
    { name: 'CipherID' },
    { name: 'CompressionFlags' },
    { name: 'MasterSeed' },
    { name: 'TransformSeed', ver: [3] },
    { name: 'TransformRounds', ver: [3] },
    { name: 'EncryptionIV' },
    { name: 'ProtectedStreamKey', ver: [3] },
    { name: 'StreamStartBytes', ver: [3] },
    { name: 'InnerRandomStreamID', ver: [3] },

    { name: 'KdfParameters', ver: [4] },
    { name: 'PublicCustomData', ver: [4] }
];

const InnerHeaderFields: HeaderField[] = [
    { name: 'EndOfHeader' },

    { name: 'InnerRandomStreamID' },
    { name: 'InnerRandomStreamKey' },
    { name: 'Binary', skipHeader: true }
];

const HeaderConst = {
    DefaultFileVersionMajor: 4,
    MinSupportedVersion: 3,
    MaxSupportedVersion: 4,
    FlagBinaryProtected: 0x01,
    InnerHeaderBinaryFieldId: 0x03,

    DefaultKdfAlgo: KdfId.Argon2d,
    DefaultKdfSaltLength: 32,
    DefaultKdfParallelism: 1,
    DefaultKdfIterations: 2,
    DefaultKdfMemory: 1024 * 1024,
    DefaultKdfVersion: 0x13,

    EndOfHeader: 0x0d0ad0a
} as const;

const DefaultMinorVersions = {
    3: 1,
    4: 0
} as const;

const LastMinorVersions: { [major: number]: number } = {
    3: 1,
    4: 1
} as const;

export class KdbxHeader {
    static readonly MaxFileVersion = HeaderConst.MaxSupportedVersion;

    versionMajor = 0;
    versionMinor = 0;
    dataCipherUuid: KdbxUuid | undefined;
    compression: number | undefined;
    masterSeed: ArrayBuffer | undefined;
    transformSeed: ArrayBuffer | undefined;
    keyEncryptionRounds: number | undefined;
    encryptionIV: ArrayBuffer | undefined;
    protectedStreamKey: ArrayBuffer | undefined;
    streamStartBytes: ArrayBuffer | undefined;
    crsAlgorithm: number | undefined;
    endPos: number | undefined;
    kdfParameters: VarDictionary | undefined;
    publicCustomData: VarDictionary | undefined;

    private readSignature(stm: BinaryStream): void {
        if (stm.byteLength < 8) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'not enough data');
        }
        const sig1 = stm.getUint32(true),
            sig2 = stm.getUint32(true);
        if (!(sig1 === Signatures.FileMagic && sig2 === Signatures.Sig2Kdbx)) {
            throw new KdbxError(ErrorCodes.BadSignature);
        }
    }

    private writeSignature(stm: BinaryStream): void {
        stm.setUint32(Signatures.FileMagic, true);
        stm.setUint32(Signatures.Sig2Kdbx, true);
    }

    private readVersion(stm: BinaryStream): void {
        const versionMinor = stm.getUint16(true);
        const versionMajor = stm.getUint16(true);
        if (
            versionMajor > HeaderConst.MaxSupportedVersion ||
            versionMajor < HeaderConst.MinSupportedVersion
        ) {
            throw new KdbxError(ErrorCodes.InvalidVersion);
        }
        if (versionMinor > LastMinorVersions[versionMajor]) {
            throw new KdbxError(ErrorCodes.InvalidVersion);
        }
        this.versionMinor = versionMinor;
        this.versionMajor = versionMajor;
    }

    private writeVersion(stm: BinaryStream): void {
        if (!this.versionMajor) {
            throw new KdbxError(ErrorCodes.InvalidState, 'version is not set');
        }
        stm.setUint16(this.versionMinor, true);
        stm.setUint16(this.versionMajor, true);
    }

    private readCipherID(bytes: ArrayBuffer): void {
        if (bytes.byteLength !== 16) {
            throw new KdbxError(ErrorCodes.Unsupported, 'cipher');
        }
        this.dataCipherUuid = new KdbxUuid(bytes);
    }

    private writeCipherID(stm: BinaryStream): void {
        if (!this.dataCipherUuid) {
            throw new KdbxError(ErrorCodes.InvalidState, 'cipher id is not set');
        }
        this.writeFieldSize(stm, 16);
        stm.writeBytes(this.dataCipherUuid.bytes);
    }

    private readCompressionFlags(bytes: ArrayBuffer): void {
        const id = new DataView(bytes).getUint32(0, true);
        if (id < 0 || id >= Object.keys(CompressionAlgorithm).length) {
            throw new KdbxError(ErrorCodes.Unsupported, 'compression');
        }
        this.compression = id;
    }

    private writeCompressionFlags(stm: BinaryStream): void {
        if (typeof this.compression !== 'number') {
            throw new KdbxError(ErrorCodes.InvalidState, 'compression is not set');
        }
        this.writeFieldSize(stm, 4);
        stm.setUint32(this.compression, true);
    }

    private readMasterSeed(bytes: ArrayBuffer): void {
        this.masterSeed = bytes;
    }

    private writeMasterSeed(stm: BinaryStream): void {
        if (!this.masterSeed) {
            throw new KdbxError(ErrorCodes.InvalidState, 'master seed is not set');
        }
        this.writeFieldBytes(stm, this.masterSeed);
    }

    private readTransformSeed(bytes: ArrayBuffer): void {
        this.transformSeed = bytes;
    }

    private writeTransformSeed(stm: BinaryStream): void {
        if (!this.transformSeed) {
            throw new KdbxError(ErrorCodes.InvalidState, 'transform seed is not set');
        }
        this.writeFieldBytes(stm, this.transformSeed);
    }

    private readTransformRounds(bytes: ArrayBuffer): void {
        this.keyEncryptionRounds = new BinaryStream(bytes).getUint64(true);
    }

    private writeTransformRounds(stm: BinaryStream): void {
        if (!this.keyEncryptionRounds) {
            throw new KdbxError(ErrorCodes.InvalidState, 'key encryption rounds is not set');
        }
        this.writeFieldSize(stm, 8);
        stm.setUint64(this.keyEncryptionRounds, true);
    }

    private readEncryptionIV(bytes: ArrayBuffer): void {
        this.encryptionIV = bytes;
    }

    private writeEncryptionIV(stm: BinaryStream): void {
        if (!this.encryptionIV) {
            throw new KdbxError(ErrorCodes.InvalidState, 'encryption IV is not set');
        }
        this.writeFieldBytes(stm, this.encryptionIV);
    }

    private readProtectedStreamKey(bytes: ArrayBuffer): void {
        this.protectedStreamKey = bytes;
    }

    private writeProtectedStreamKey(stm: BinaryStream): void {
        if (!this.protectedStreamKey) {
            throw new KdbxError(ErrorCodes.InvalidState, 'protected stream key is not set');
        }
        this.writeFieldBytes(stm, this.protectedStreamKey);
    }

    private readStreamStartBytes(bytes: ArrayBuffer): void {
        this.streamStartBytes = bytes;
    }

    private writeStreamStartBytes(stm: BinaryStream): void {
        if (!this.streamStartBytes) {
            throw new KdbxError(ErrorCodes.InvalidState, 'stream start bytes is not set');
        }
        this.writeFieldBytes(stm, this.streamStartBytes);
    }

    private readInnerRandomStreamID(bytes: ArrayBuffer): void {
        this.crsAlgorithm = new DataView(bytes).getUint32(0, true);
    }

    private writeInnerRandomStreamID(stm: BinaryStream): void {
        if (!this.crsAlgorithm) {
            throw new KdbxError(ErrorCodes.InvalidState, 'CRSAlgorithm is not set');
        }
        this.writeFieldSize(stm, 4);
        stm.setUint32(this.crsAlgorithm, true);
    }

    private readInnerRandomStreamKey(bytes: ArrayBuffer): void {
        this.protectedStreamKey = bytes;
    }

    private writeInnerRandomStreamKey(stm: BinaryStream): void {
        if (!this.protectedStreamKey) {
            throw new KdbxError(ErrorCodes.InvalidState, 'protected stream key is not set');
        }
        this.writeFieldBytes(stm, this.protectedStreamKey);
    }

    private readKdfParameters(bytes: ArrayBuffer): void {
        this.kdfParameters = VarDictionary.read(new BinaryStream(bytes));
    }

    private writeKdfParameters(stm: BinaryStream): void {
        if (!this.kdfParameters) {
            throw new KdbxError(ErrorCodes.InvalidState, 'KDF parameters are not set');
        }
        const innerStream = new BinaryStream();
        this.kdfParameters.write(innerStream);
        this.writeFieldBytes(stm, innerStream.getWrittenBytes());
    }

    private readPublicCustomData(bytes: ArrayBuffer): void {
        this.publicCustomData = VarDictionary.read(new BinaryStream(bytes));
    }

    private hasPublicCustomData(): boolean {
        return !!this.publicCustomData;
    }

    private writePublicCustomData(stm: BinaryStream): void {
        if (this.publicCustomData) {
            const innerStream = new BinaryStream();
            this.publicCustomData.write(innerStream);
            this.writeFieldBytes(stm, innerStream.getWrittenBytes());
        }
    }

    private readBinary(bytes: ArrayBuffer, ctx: KdbxContext): void {
        const view = new DataView(bytes);
        const flags = view.getUint8(0);
        const isProtected = flags & HeaderConst.FlagBinaryProtected;
        const binaryData = bytes.slice(1); // Actual data comes after the flag byte

        const binary = isProtected ? ProtectedValue.fromBinary(binaryData) : binaryData;

        ctx.kdbx.binaries.addWithNextId(binary);
    }

    private writeBinary(stm: BinaryStream, ctx: KdbxContext): void {
        if (this.versionMajor < 4) {
            return;
        }
        const binaries = ctx.kdbx.binaries.getAll();
        for (const binary of binaries) {
            stm.setUint8(HeaderConst.InnerHeaderBinaryFieldId);
            if (binary.value instanceof ProtectedValue) {
                const binaryData = binary.value.getBinary();
                this.writeFieldSize(stm, binaryData.byteLength + 1);
                stm.setUint8(HeaderConst.FlagBinaryProtected);
                stm.writeBytes(binaryData);
                zeroBuffer(binaryData);
            } else {
                this.writeFieldSize(stm, binary.value.byteLength + 1);
                stm.setUint8(0);
                stm.writeBytes(binary.value);
            }
        }
    }

    private writeEndOfHeader(stm: BinaryStream): void {
        this.writeFieldSize(stm, 4);
        stm.setUint32(HeaderConst.EndOfHeader, false);
    }

    private readField(stm: BinaryStream, fields: HeaderField[], ctx: KdbxContext) {
        const headerId = stm.getUint8();
        const size = this.readFieldSize(stm);
        const bytes = size > 0 ? stm.readBytes(size) : new ArrayBuffer(0);

        const headerField = fields[headerId];
        switch (headerField.name) {
            case 'EndOfHeader':
            case 'Comment':
                break;
            case 'CipherID':
                this.readCipherID(bytes);
                break;
            case 'CompressionFlags':
                this.readCompressionFlags(bytes);
                break;
            case 'MasterSeed':
                this.readMasterSeed(bytes);
                break;
            case 'TransformSeed':
                this.readTransformSeed(bytes);
                break;
            case 'TransformRounds':
                this.readTransformRounds(bytes);
                break;
            case 'EncryptionIV':
                this.readEncryptionIV(bytes);
                break;
            case 'ProtectedStreamKey':
                this.readProtectedStreamKey(bytes);
                break;
            case 'StreamStartBytes':
                this.readStreamStartBytes(bytes);
                break;
            case 'InnerRandomStreamID':
                this.readInnerRandomStreamID(bytes);
                break;
            case 'KdfParameters':
                this.readKdfParameters(bytes);
                break;
            case 'PublicCustomData':
                this.readPublicCustomData(bytes);
                break;
            case 'InnerRandomStreamKey':
                this.readInnerRandomStreamKey(bytes);
                break;
            case 'Binary':
                this.readBinary(bytes, ctx);
                break;
            default:
                throw new KdbxError(ErrorCodes.InvalidArg, `bad header field: ${headerField.name}`);
        }
        return headerId !== 0;
    }

    private writeField(
        stm: BinaryStream,
        headerId: number,
        fields: HeaderField[],
        ctx?: KdbxContext
    ) {
        const headerField = fields[headerId];
        if (headerField) {
            if (headerField.ver && !headerField.ver.includes(this.versionMajor)) {
                return;
            }

            switch (headerField.name) {
                case 'PublicCustomData':
                    if (!this.hasPublicCustomData()) {
                        return;
                    }
                    break;
                case 'Comment':
                    return;
            }

            if (!headerField.skipHeader) {
                stm.setUint8(headerId);
            }
            switch (headerField.name) {
                case 'EndOfHeader':
                    this.writeEndOfHeader(stm);
                    break;
                case 'CipherID':
                    this.writeCipherID(stm);
                    break;
                case 'CompressionFlags':
                    this.writeCompressionFlags(stm);
                    break;
                case 'MasterSeed':
                    this.writeMasterSeed(stm);
                    break;
                case 'TransformSeed':
                    this.writeTransformSeed(stm);
                    break;
                case 'TransformRounds':
                    this.writeTransformRounds(stm);
                    break;
                case 'EncryptionIV':
                    this.writeEncryptionIV(stm);
                    break;
                case 'ProtectedStreamKey':
                    this.writeProtectedStreamKey(stm);
                    break;
                case 'StreamStartBytes':
                    this.writeStreamStartBytes(stm);
                    break;
                case 'InnerRandomStreamID':
                    this.writeInnerRandomStreamID(stm);
                    break;
                case 'KdfParameters':
                    this.writeKdfParameters(stm);
                    break;
                case 'PublicCustomData':
                    this.writePublicCustomData(stm);
                    break;
                case 'InnerRandomStreamKey':
                    this.writeInnerRandomStreamKey(stm);
                    break;
                case 'Binary':
                    if (!ctx) {
                        throw new KdbxError(ErrorCodes.InvalidArg, 'context is not set');
                    }
                    this.writeBinary(stm, ctx);
                    break;
                default:
                    throw new KdbxError(
                        ErrorCodes.InvalidArg,
                        `Bad header field: ${headerField.name}`
                    );
            }
        }
    }

    private readFieldSize(stm: BinaryStream): number {
        return (this.versionMajor | 0) >= 4 ? stm.getUint32(true) : stm.getUint16(true);
    }

    private writeFieldSize(stm: BinaryStream, size: number) {
        if ((this.versionMajor | 0) >= 4) {
            stm.setUint32(size, true);
        } else {
            stm.setUint16(size, true);
        }
    }

    private writeFieldBytes(stm: BinaryStream, bytes: ArrayBuffer): void {
        this.writeFieldSize(stm, bytes.byteLength);
        stm.writeBytes(bytes);
    }

    private validate(): void {
        if (!this.versionMajor || this.versionMinor === undefined) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no version in header');
        }
        if (this.dataCipherUuid === undefined) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no cipher in header');
        }
        if (this.compression === undefined) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no compression in header');
        }
        if (!this.masterSeed) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no master seed in header');
        }
        if (this.versionMajor < 4 && !this.transformSeed) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no transform seed in header');
        }
        if (this.versionMajor < 4 && !this.keyEncryptionRounds) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no key encryption rounds in header');
        }
        if (!this.encryptionIV) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no encryption iv in header');
        }
        if (this.versionMajor < 4 && !this.protectedStreamKey) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no protected stream key in header');
        }
        if (this.versionMajor < 4 && !this.streamStartBytes) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no stream start bytes in header');
        }
        if (this.versionMajor < 4 && !this.crsAlgorithm) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no crs algorithm in header');
        }
        if (this.versionMajor >= 4 && !this.kdfParameters) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no kdf parameters in header');
        }
    }

    private validateInner(): void {
        if (!this.protectedStreamKey) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no protected stream key in header');
        }
        if (!this.crsAlgorithm) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'no crs algorithm in header');
        }
    }

    private createKdfParameters(algo?: string): void {
        if (!algo) {
            algo = HeaderConst.DefaultKdfAlgo;
        }
        switch (algo) {
            case KdfId.Argon2d:
            case KdfId.Argon2id:
                this.kdfParameters = new VarDictionary();
                this.kdfParameters.set('$UUID', ValueType.Bytes, base64ToBytes(algo));
                this.kdfParameters.set(
                    'S',
                    ValueType.Bytes,
                    CryptoEngine.random(HeaderConst.DefaultKdfSaltLength)
                );
                this.kdfParameters.set('P', ValueType.UInt32, HeaderConst.DefaultKdfParallelism);
                this.kdfParameters.set(
                    'I',
                    ValueType.UInt64,
                    new Int64(HeaderConst.DefaultKdfIterations)
                );
                this.kdfParameters.set(
                    'M',
                    ValueType.UInt64,
                    new Int64(HeaderConst.DefaultKdfMemory)
                );
                this.kdfParameters.set('V', ValueType.UInt32, HeaderConst.DefaultKdfVersion);
                break;
            case KdfId.Aes:
                this.kdfParameters = new VarDictionary();
                this.kdfParameters.set('$UUID', ValueType.Bytes, base64ToBytes(KdfId.Aes));
                this.kdfParameters.set(
                    'S',
                    ValueType.Bytes,
                    CryptoEngine.random(HeaderConst.DefaultKdfSaltLength)
                );
                this.kdfParameters.set(
                    'R',
                    ValueType.UInt64,
                    new Int64(Defaults.KeyEncryptionRounds)
                );
                break;
            default:
                throw new KdbxError(ErrorCodes.InvalidArg, 'bad KDF algo');
        }
    }

    write(stm: BinaryStream): void {
        this.validate();
        this.writeSignature(stm);
        this.writeVersion(stm);
        for (let id = 1; id < HeaderFields.length; id++) {
            this.writeField(stm, id, HeaderFields);
        }
        this.writeField(stm, 0, HeaderFields);
        this.endPos = stm.pos;
    }

    writeInnerHeader(stm: BinaryStream, ctx: KdbxContext): void {
        this.validateInner();
        for (let id = 1; id < InnerHeaderFields.length; id++) {
            this.writeField(stm, id, InnerHeaderFields, ctx);
        }
        this.writeField(stm, 0, InnerHeaderFields, ctx);
    }

    generateSalts(): void {
        this.masterSeed = CryptoEngine.random(32);
        if (this.versionMajor < 4) {
            this.transformSeed = CryptoEngine.random(32);
            this.streamStartBytes = CryptoEngine.random(32);
            this.protectedStreamKey = CryptoEngine.random(32);
            this.encryptionIV = CryptoEngine.random(16);
        } else {
            this.protectedStreamKey = CryptoEngine.random(64);
            if (!this.kdfParameters || !this.dataCipherUuid) {
                throw new KdbxError(ErrorCodes.InvalidState, 'no kdf params');
            }
            this.kdfParameters.set('S', ValueType.Bytes, CryptoEngine.random(32));
            const ivLength = this.dataCipherUuid.toString() === CipherId.ChaCha20 ? 12 : 16;
            this.encryptionIV = CryptoEngine.random(ivLength);
        }
    }

    setVersion(version: number): void {
        if (version !== 3 && version !== 4) {
            throw new KdbxError(ErrorCodes.InvalidArg, 'bad file version');
        }
        this.versionMajor = version;
        this.versionMinor = DefaultMinorVersions[version];
        if (this.versionMajor === 4) {
            if (!this.kdfParameters) {
                this.createKdfParameters();
            }
            this.crsAlgorithm = CrsAlgorithm.ChaCha20;
            this.keyEncryptionRounds = undefined;
        } else {
            this.kdfParameters = undefined;
            this.crsAlgorithm = CrsAlgorithm.Salsa20;
            this.keyEncryptionRounds = Defaults.KeyEncryptionRounds;
        }
    }

    setKdf(kdf: string): void {
        this.createKdfParameters(kdf);
    }

    static read(stm: BinaryStream, ctx: KdbxContext): KdbxHeader {
        const header = new KdbxHeader();
        header.readSignature(stm);
        header.readVersion(stm);
        while (header.readField(stm, HeaderFields, ctx)) {}
        header.endPos = stm.pos;
        header.validate();
        return header;
    }

    readInnerHeader(stm: BinaryStream, ctx: KdbxContext): void {
        while (this.readField(stm, InnerHeaderFields, ctx)) {}
        this.validateInner();
    }

    static create(): KdbxHeader {
        const header = new KdbxHeader();
        header.versionMajor = HeaderConst.DefaultFileVersionMajor;
        header.versionMinor = DefaultMinorVersions[HeaderConst.DefaultFileVersionMajor];
        header.dataCipherUuid = new KdbxUuid(CipherId.Aes);
        header.compression = CompressionAlgorithm.GZip;
        header.crsAlgorithm = CrsAlgorithm.ChaCha20;
        header.createKdfParameters();
        return header;
    }
}
