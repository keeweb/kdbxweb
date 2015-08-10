'use strict';

var
    asmCrypto = require('asmcrypto.js'),
    BinaryStream = require('./../utils/binary-stream'),
    KdbxError = require('./../errors/kdbx-error'),
    Consts = require('./../defs/consts'),
    ByteUtils = require('./../utils/byte-utils');

var BlockSize = 1024*1024;

/**
 * Encrypt buffer
 * @param {ArrayBuffer} data
 * @returns {ArrayBuffer}
 */
function decrypt(data) {
    var stm = new BinaryStream(data);
    var buffers = [];
    var blockIndex = 0, blockLength = 0, blockHash, totalLength = 0;
    do {
        blockIndex = stm.getUint32(true);
        blockHash = stm.readBytes(32);
        blockLength = stm.getUint32(true);
        if (blockLength > 0) {
            var blockData = stm.readBytes(blockLength);
            var calculatedHash = asmCrypto.SHA256.bytes(blockData);
            if (!ByteUtils.arrayBufferEquals(calculatedHash, blockHash)) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'invalid hash block');
            } else {
                buffers.push(blockData);
            }
        }
        totalLength += blockLength;
    } while(blockLength > 0);
    var ret = new Uint8Array(totalLength);
    var offset = 0;
    for (var i = 0; i < buffers.length; i++) {
        ret.set(new Uint8Array(buffers[i]), offset);
        offset += buffers[i].byteLength;
    }
    return ret.buffer;
}

/**
 * Decrypt buffer
 * @param {ArrayBuffer} data
 * @returns {ArrayBuffer}
 */
function encrypt(data) {
    var bytesLeft = data.byteLength;
    var currentOffset = 0, blockIndex = 0, totalLength = 0;
    var buffers = [];
    while (bytesLeft > 0) {
        var blockLength = Math.max(BlockSize, bytesLeft);
        bytesLeft -= blockLength;

        var blockData = data.slice(currentOffset, currentOffset + blockLength);
        var blockHash = asmCrypto.SHA256.bytes(blockData);

        var blockBuffer = new ArrayBuffer(4 + 32 + 4);
        var stm = new BinaryStream(blockBuffer.buffer);
        stm.setUint32(blockIndex, true);
        stm.writeBytes(blockHash);
        stm.setUint32(blockLength, true);

        buffers.push(blockBuffer);
        totalLength += blockBuffer.byteLength;
        buffers.push(blockData);
        totalLength += blockData.byteLength;

        blockIndex++;
        currentOffset += blockLength;
    }

    var endBlockData = new ArrayBuffer(40);
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

module.exports.decrypt = decrypt;
module.exports.encrypt = encrypt;
