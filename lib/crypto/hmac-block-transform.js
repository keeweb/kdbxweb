'use strict';

var
    Int64 = require('../utils/int64'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    CryptoEngine = require('./crypto-engine');

// var BlockSize = 1024*1024;

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
    return CryptoEngine.sha512(ByteUtils.arrayToBuffer(shaSrc)).then(function(sha) {
        ByteUtils.zeroBuffer(shaSrc);
        return sha;
    });
}

/**
 * Decrypt buffer
 * @param {BinaryStream} stm
 * @param {ArrayBuffer} key
 * @returns {Promise.<ArrayBuffer>}
 */
function decrypt(stm, key) {
    return new Promise(function(resolve, reject) {
        var buffers = [];
        var blockIndex = 0, blockLength = 0, blockHash, totalLength = 0;
        next();
        function next() {
            blockHash = stm.readBytes(32);
            blockLength = stm.getUint32(true);
            if (blockLength > 0) {
                totalLength += blockLength;
                var blockData = stm.readBytes(blockLength);
                getHmacKey(key, new Int64(blockIndex)).then(function(blockKey) {
                    var blockDataForHash = new Uint8Array(blockData.byteLength + 4 + 8);
                    var blockDataForHashView = new DataView(blockDataForHash.buffer);
                    blockDataForHash.set(new Uint8Array(blockData), 4 + 8);
                    blockDataForHashView.setInt32(0, blockIndex, true);
                    blockDataForHashView.setInt32(8, blockLength, true);
                    CryptoEngine.hmacSha256(blockKey, blockDataForHash.buffer).then(function(calculatedBlockHash) {
                        if (!ByteUtils.arrayBufferEquals(calculatedBlockHash, blockHash)) {
                            reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'invalid hash block'));
                        } else {
                            buffers.push(blockData);
                            blockIndex++;
                            next();
                        }
                    });
                });
            } else {
                var ret = new Uint8Array(totalLength);
                var offset = 0;
                for (var i = 0; i < buffers.length; i++) {
                    ret.set(new Uint8Array(buffers[i]), offset);
                    offset += buffers[i].byteLength;
                }
                resolve(ret.buffer);
            }
        }
    });
}

module.exports.getHmacKey = getHmacKey;
module.exports.decrypt = decrypt;
