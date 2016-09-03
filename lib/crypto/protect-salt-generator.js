'use strict';

var Salsa20 = require('./salsa20'),
    ByteUtils = require('./../utils/byte-utils');

var SalsaNonce = [0xE8, 0x30, 0x09, 0x4B, 0x97, 0x20, 0x5D, 0x2A];

/**
 * Protect information used for decrypt and encrypt protected data fields
 * @constructor
 */
var ProtectSaltGenerator = function(key) {
    this.key = new Uint8Array(ByteUtils.arrayToBuffer(asmCrypto.SHA256.bytes(key)));
    this.algo = new Salsa20(this.key, SalsaNonce);
};

/**
 * Get salt bytes
 * @param {number} len - bytes count
 * @return {ArrayBuffer} - salt bytes
 */
ProtectSaltGenerator.prototype.getSalt = function(len) {
    return ByteUtils.arrayToBuffer(this.algo.getBytes(len));
};

module.exports = ProtectSaltGenerator;
