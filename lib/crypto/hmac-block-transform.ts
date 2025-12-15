import { Int64 } from '../utils/int64';
import { arrayBufferEquals, arrayToBuffer, zeroBuffer } from '../utils/byte-utils';
import * as CryptoEngine from '../crypto/crypto-engine';
import { BinaryStream } from '../utils/binary-stream';
import { Bytes } from '../defs/bytes';
import { KdbxError } from '../errors/kdbx-error';
import { ErrorCodes } from '../defs/consts';

const BlockSize = 1024 * 1024;

export function getHmacKey(key: Bytes, blockIndex: Int64): Promise<ArrayBuffer> {
    const keyArr = key instanceof ArrayBuffer ? new Uint8Array(key) : key;
    const shaSrc = new Uint8Array(8 + keyArr.byteLength);
    shaSrc.set(keyArr, 8);
    const view = new DataView(shaSrc.buffer);
    view.setUint32(0, blockIndex.lo, true);
    view.setUint32(4, blockIndex.hi, true);
    return CryptoEngine.sha512(arrayToBuffer(shaSrc)).then((sha) => {
        zeroBuffer(shaSrc);
        return sha;
    });
}

function getBlockHmac(
    key: Bytes,
    blockIndex: number,
    blockLength: number,
    blockData: Bytes
): Promise<ArrayBuffer> {
    return getHmacKey(key, new Int64(blockIndex)).then((blockKey) => {
        const blockDataArr = blockData instanceof ArrayBuffer ? new Uint8Array(blockData) : blockData;
        const blockDataForHash = new Uint8Array(blockDataArr.byteLength + 4 + 8);
        const blockDataForHashView = new DataView(blockDataForHash.buffer);
        blockDataForHash.set(blockDataArr, 4 + 8);
        blockDataForHashView.setInt32(0, blockIndex, true);
        blockDataForHashView.setInt32(8, blockLength, true);
        return CryptoEngine.hmacSha256(blockKey, arrayToBuffer(blockDataForHash));
    });
}

export function decrypt(data: Bytes, key: Bytes): Promise<ArrayBuffer> {
    const stm = new BinaryStream(arrayToBuffer(data));
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

export function encrypt(data: Bytes, key: Bytes): Promise<ArrayBuffer> {
    return Promise.resolve().then(() => {
        const dataArr = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
        let bytesLeft = dataArr.byteLength;
        let currentOffset = 0,
            blockIndex = 0,
            totalLength = 0;
        const buffers: ArrayBuffer[] = [];

        const next = (): Promise<ArrayBuffer> => {
            const blockLength = Math.min(BlockSize, bytesLeft);
            bytesLeft -= blockLength;

            const blockData = dataArr.subarray(currentOffset, currentOffset + blockLength);
            return getBlockHmac(key, blockIndex, blockLength, blockData).then((blockHash) => {
                const blockBuffer = new ArrayBuffer(32 + 4);
                const stm = new BinaryStream(blockBuffer);
                stm.writeBytes(blockHash);
                stm.setUint32(blockLength, true);

                buffers.push(blockBuffer);
                totalLength += blockBuffer.byteLength;

                if (blockData.byteLength > 0) {
                    buffers.push(arrayToBuffer(blockData));
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
