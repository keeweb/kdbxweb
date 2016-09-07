'use strict';

var Salsa20 = require('./salsa20'),
    CryptoEngine = require('./crypto-engine'),
    ByteUtils = require('./../utils/byte-utils');

var SalsaNonce = [0xE8, 0x30, 0x09, 0x4B, 0x97, 0x20, 0x5D, 0x2A];

/**
 * Protect information used for decrypt and encrypt protected data fields
 * @constructor
 */
var ProtectSaltGenerator = function(key) {
    var that = this;
    this.ready = CryptoEngine.sha256(key).then(function(hash) {
        that.key = new Uint8Array(hash);
        that.algo = new Salsa20(that.key, SalsaNonce);
        return that;
    });
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
