'use strict';

var Int64 = require('../utils/int64'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    BinaryStream = require('../utils/binary-stream'),
    CryptoEngine = require('./crypto-engine');

var BlockSize = 1024 * 1024;

/**
 * Computes HMAC-SHA key
 * @param {ArrayBuffer} key
 * @param {Int64} blockIndex
 * @returns {Promise.<ArrayBuffer>}
 */
function getHmacKey(key, blockIndex) {
    var shaSrc = new Uint8Array(8 + key.byteLength);
    shaSrc.set(new Uint8Array(key), 8);
    var view = new DataView(shaSrc.buffer);
    view.setUint32(0, blockIndex.lo, true);
    view.setUint32(4, blockIndex.hi, true);
    return CryptoEngine.sha512(ByteUtils.arrayToBuffer(shaSrc)).then(function (sha) {
        ByteUtils.zeroBuffer(shaSrc);
        return sha;
    });
}

/**
 * Gets block HMAC
 * @param {ArrayBuffer} key
 * @param {number} blockIndex
 * @param {number} blockLength
 * @param {ArrayBuffer} blockData
 * @returns {Promise.<ArrayBuffer>}
 */
function getBlockHmac(key, blockIndex, blockLength, blockData) {
    return getHmacKey(key, new Int64(blockIndex)).then(function (blockKey) {
        var blockDataForHash = new Uint8Array(blockData.byteLength + 4 + 8);
        var blockDataForHashView = new DataView(blockDataForHash.buffer);
        blockDataForHash.set(new Uint8Array(blockData), 4 + 8);
        blockDataForHashView.setInt32(0, blockIndex, true);
        blockDataForHashView.setInt32(8, blockLength, true);
        return CryptoEngine.hmacSha256(blockKey, blockDataForHash.buffer);
    });
}

/**
 * Decrypt buffer
 * @param {ArrayBuffer} data
 * @param {ArrayBuffer} key
 * @returns {Promise.<ArrayBuffer>}
 */
function decrypt(data, key) {
    var stm = new BinaryStream(data);
    return Promise.resolve().then(function () {
        var buffers = [];
        var blockIndex = 0,
            blockLength = 0,
            blockHash,
            totalLength = 0;

        var next = function () {
            blockHash = stm.readBytes(32);
            blockLength = stm.getUint32(true);
            if (blockLength > 0) {
                totalLength += blockLength;
                var blockData = stm.readBytes(blockLength);
                return getBlockHmac(key, blockIndex, blockLength, blockData).then(function (
                    calculatedBlockHash
                ) {
                    if (!ByteUtils.arrayBufferEquals(calculatedBlockHash, blockHash)) {
                        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'invalid hash block');
                    } else {
                        buffers.push(blockData);
                        blockIndex++;
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
 * @param {ArrayBuffer} key
 * @returns {Promise.<ArrayBuffer>}
 */
function encrypt(data, key) {
    return Promise.resolve().then(function () {
        var bytesLeft = data.byteLength;
        var currentOffset = 0,
            blockIndex = 0,
            totalLength = 0;
        var buffers = [];

        var next = function () {
            var blockLength = Math.min(BlockSize, bytesLeft);
            bytesLeft -= blockLength;

            var blockData = data.slice(currentOffset, currentOffset + blockLength);
            return getBlockHmac(key, blockIndex, blockLength, blockData).then(function (blockHash) {
                var blockBuffer = new ArrayBuffer(32 + 4);
                var stm = new BinaryStream(blockBuffer);
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
                    var ret = new Uint8Array(totalLength);
                    var offset = 0;
                    for (var i = 0; i < buffers.length; i++) {
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

module.exports.getHmacKey = getHmacKey;
module.exports.decrypt = decrypt;
module.exports.encrypt = encrypt;
