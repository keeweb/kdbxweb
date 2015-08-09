'use strict';

var asmCrypto = require('asmcrypto.js'),
    Salsa20 = require('./salsa20');

var SalsaNonce = [0xE8, 0x30, 0x09, 0x4B, 0x97, 0x20, 0x5D, 0x2A];

/**
 * Protect information used for decrypt and encrypt protected data fields
 * @constructor
 */
var ProtectSaltGenerator = function(key) {
    this.key = new Uint8Array(asmCrypto.SHA256.bytes(key).buffer);
    this.algo = new Salsa20(this.key, SalsaNonce);
};

/**
 * Get salt bytes
 * @param {number} len - bytes count
 * @return {ArrayBuffer} - salt bytes
 */
ProtectSaltGenerator.prototype.getSalt = function(len) {
    return this.algo.getBytes(len).buffer;
};

module.exports = ProtectSaltGenerator;
