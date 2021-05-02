import { BinaryStream } from '../utils/binary-stream';
import * as CryptoEngine from '../crypto/crypto-engine';
import { KdbxError } from '../errors/kdbx-error';
import { arrayBufferEquals } from '../utils/byte-utils';
import { ErrorCodes } from '../defs/consts';

const BlockSize = 1024 * 1024;

export function decrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    return Promise.resolve().then(() => {
        const stm = new BinaryStream(data);
        const buffers: ArrayBuffer[] = [];
        let // blockIndex = 0,
            blockLength = 0,
            blockHash: ArrayBuffer,
            totalLength = 0;

        const next = (): Promise<ArrayBuffer> => {
            /* blockIndex = */ stm.getUint32(true);
            blockHash = stm.readBytes(32);
            blockLength = stm.getUint32(true);
            if (blockLength > 0) {
                totalLength += blockLength;
                const blockData = stm.readBytes(blockLength);
                return CryptoEngine.sha256(blockData).then((calculatedHash) => {
                    if (!arrayBufferEquals(calculatedHash, blockHash)) {
                        throw new KdbxError(ErrorCodes.FileCorrupt, 'invalid hash block');
                    } else {
                        buffers.push(blockData);
                        return next();
                    }
                });
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

export function encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    return Promise.resolve().then(() => {
        let bytesLeft = data.byteLength;
        let currentOffset = 0,
            blockIndex = 0,
            totalLength = 0;
        const buffers: ArrayBuffer[] = [];

        const next = (): Promise<ArrayBuffer> => {
            if (bytesLeft > 0) {
                const blockLength = Math.min(BlockSize, bytesLeft);
                bytesLeft -= blockLength;

                const blockData = data.slice(currentOffset, currentOffset + blockLength);
                return CryptoEngine.sha256(blockData).then((blockHash) => {
                    const blockBuffer = new ArrayBuffer(4 + 32 + 4);
                    const stm = new BinaryStream(blockBuffer);
                    stm.setUint32(blockIndex, true);
                    stm.writeBytes(blockHash);
                    stm.setUint32(blockLength, true);

                    buffers.push(blockBuffer);
                    totalLength += blockBuffer.byteLength;
                    buffers.push(blockData);
                    totalLength += blockData.byteLength;

                    blockIndex++;
                    currentOffset += blockLength;

                    return next();
                });
            } else {
                const endBlockData = new ArrayBuffer(4 + 32 + 4);
                const view = new DataView(endBlockData);
                view.setUint32(0, blockIndex, true);
                buffers.push(endBlockData);
                totalLength += endBlockData.byteLength;

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
