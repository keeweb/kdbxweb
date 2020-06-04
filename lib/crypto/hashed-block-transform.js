'use strict';

var BinaryStream = require('./../utils/binary-stream'),
    KdbxError = require('./../errors/kdbx-error'),
    Consts = require('./../defs/consts'),
    ByteUtils = require('./../utils/byte-utils'),
    CryptoEngine = require('./crypto-engine');

var BlockSize = 1024 * 1024;

/**
 * Decrypt buffer
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function decrypt(data) {
    return Promise.resolve().then(function () {
        var stm = new BinaryStream(data);
        var buffers = [];
        var // blockIndex = 0,
            blockLength = 0,
            blockHash,
            totalLength = 0;

        var next = function () {
            /* blockIndex = */ stm.getUint32(true);
            blockHash = stm.readBytes(32);
            blockLength = stm.getUint32(true);
            if (blockLength > 0) {
                totalLength += blockLength;
                var blockData = stm.readBytes(blockLength);
                return CryptoEngine.sha256(blockData).then(function (calculatedHash) {
                    if (!ByteUtils.arrayBufferEquals(calculatedHash, blockHash)) {
                        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'invalid hash block');
                    } else {
                        buffers.push(blockData);
                        return next();
                    }
                });
            } else {
                var ret = new Uint8Array(totalLength);
                var offset = 0;
                for (var i = 0; i < buffers.length; i++) {
                    ret.set(new Uint8Array(buffers[i]), offset);
                    offset += buffers[i].byteLength;
                }
                return ret.buffer;
            }
        };
        return next();
    });
}

/**
 * Encrypt buffer
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function encrypt(data) {
    return Promise.resolve().then(function () {
        var bytesLeft = data.byteLength;
        var currentOffset = 0,
            blockIndex = 0,
            totalLength = 0;
        var buffers = [];

        var next = function () {
            if (bytesLeft > 0) {
                var blockLength = Math.min(BlockSize, bytesLeft);
                bytesLeft -= blockLength;

                var blockData = data.slice(currentOffset, currentOffset + blockLength);
                return CryptoEngine.sha256(blockData).then(function (blockHash) {
                    var blockBuffer = new ArrayBuffer(4 + 32 + 4);
                    var stm = new BinaryStream(blockBuffer);
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
                var endBlockData = new ArrayBuffer(4 + 32 + 4);
                var view = new DataView(endBlockData);
                view.setUint32(0, blockIndex, true);
                buffers.push(endBlockData);
                totalLength += endBlockData.byteLength;

                var ret = new Uint8Array(totalLength);
                var offset = 0;
                for (var i = 0; i < buffers.length; i++) {
                    ret.set(new Uint8Array(buffers[i]), offset);
                    offset += buffers[i].byteLength;
                }
                return ret.buffer;
            }
        };
        return next();
    });
}

module.exports.decrypt = decrypt;
module.exports.encrypt = encrypt;
