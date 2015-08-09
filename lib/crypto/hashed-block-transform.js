'use strict';

var
    asmCrypto = require('asmcrypto.js'),
    BinaryStream = require('./../utils/binary-stream'),
    KdbxError = require('./../errors/kdbx-error'),
    Consts = require('./../defs/consts'),
    ByteUtils = require('./../utils/byte-utils');

var HashedBlockTransform = {
    decrypt: function(data) {
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
        data = new Int8Array(totalLength);
        var offset = 0;
        for (var i = 0; i < buffers.length; i++) {
            data.set(new Int8Array(buffers[i]), offset);
            offset += buffers[i].byteLength;
        }
        return data.buffer;
    }
};

module.exports = HashedBlockTransform;
