import { Int64 } from '../utils/int64';
import { arrayBufferEquals, arrayToBuffer, zeroBuffer } from '../utils/byte-utils';
import * as CryptoEngine from '../crypto/crypto-engine';
import { BinaryStream } from '../utils/binary-stream';
import { KdbxError } from '../errors/kdbx-error';
import { ErrorCodes } from '../defs/consts';

const BlockSize = 1024 * 1024;

export function getHmacKey(key: ArrayBuffer, blockIndex: Int64): Promise<ArrayBuffer> {
    const shaSrc = new Uint8Array(8 + key.byteLength);
    shaSrc.set(new Uint8Array(key), 8);
    const view = new DataView(shaSrc.buffer);
    view.setUint32(0, blockIndex.lo, true);
    view.setUint32(4, blockIndex.hi, true);
    return CryptoEngine.sha512(arrayToBuffer(shaSrc)).then((sha) => {
        zeroBuffer(shaSrc);
        return sha;
    });
}

function getBlockHmac(
    key: ArrayBuffer,
    blockIndex: number,
    blockLength: number,
    blockData: ArrayBuffer
): Promise<ArrayBuffer> {
    return getHmacKey(key, new Int64(blockIndex)).then((blockKey) => {
        const blockDataForHash = new Uint8Array(blockData.byteLength + 4 + 8);
        const blockDataForHashView = new DataView(blockDataForHash.buffer);
        blockDataForHash.set(new Uint8Array(blockData), 4 + 8);
        blockDataForHashView.setInt32(0, blockIndex, true);
        blockDataForHashView.setInt32(8, blockLength, true);
        return CryptoEngine.hmacSha256(blockKey, blockDataForHash.buffer);
    });
}

export function decrypt(data: ArrayBuffer, key: ArrayBuffer): Promise<ArrayBuffer> {
    const stm = new BinaryStream(data);
    return Promise.resolve().then(() => {
        const buffers: ArrayBuffer[] = [];
        let blockIndex = 0,
            blockLength = 0,
            blockHash: ArrayBuffer,
            totalLength = 0;

        const next = (): Promise<ArrayBuffer> => {
            blockHash = stm.readBytes(32);
            blockLength = stm.getUint32(true);
            if (blockLength > 0) {
                totalLength += blockLength;
                const blockData = stm.readBytes(blockLength);
                return getBlockHmac(key, blockIndex, blockLength, blockData).then(
                    (calculatedBlockHash) => {
                        if (!arrayBufferEquals(calculatedBlockHash, blockHash)) {
                            throw new KdbxError(ErrorCodes.FileCorrupt, 'invalid hash block');
                        } else {
                            buffers.push(blockData);
                            blockIndex++;
                            return next();
                        }
                    }
                );
            } else {
                const ret = new Uint8Array(totalLength);
                let offset = 0;
                for (let i = 0; i < buffers.length; i++) {
                    ret.set(new Uint8Array(buffers[i]), offset);
                    offset += buffers[i].byteLength;
                }
                return Promise.resolve(ret.buffer);
            }
        };
        return next();
    });
}

export function encrypt(data: ArrayBuffer, key: ArrayBuffer): Promise<ArrayBuffer> {
    return Promise.resolve().then(() => {
        let bytesLeft = data.byteLength;
        let currentOffset = 0,
            blockIndex = 0,
            totalLength = 0;
        const buffers: ArrayBuffer[] = [];

        const next = (): Promise<ArrayBuffer> => {
            const blockLength = Math.min(BlockSize, bytesLeft);
            bytesLeft -= blockLength;

            const blockData = data.slice(currentOffset, currentOffset + blockLength);
            return getBlockHmac(key, blockIndex, blockLength, blockData).then((blockHash) => {
                const blockBuffer = new ArrayBuffer(32 + 4);
                const stm = new BinaryStream(blockBuffer);
                stm.writeBytes(blockHash);
                stm.setUint32(blockLength, true);

                buffers.push(blockBuffer);
                totalLength += blockBuffer.byteLength;

                if (blockData.byteLength > 0) {
                    buffers.push(blockData);
                    totalLength += blockData.byteLength;
                    blockIndex++;
                    currentOffset += blockLength;
                    return next();
                } else {
                    const ret = new Uint8Array(totalLength);
                    let offset = 0;
                    for (let i = 0; i < buffers.length; i++) {
                        ret.set(new Uint8Array(buffers[i]), offset);
                        offset += buffers[i].byteLength;
                    }
                    return ret.buffer;
                }
            });
        };
        return next();
    });
}
