'use strict';

var Salsa20 = require('./salsa20'),
    ChaCha20 = require('./chacha20'),
    Consts = require('../defs/consts'),
    KdbxError = require('../errors/kdbx-error'),
    CryptoEngine = require('./crypto-engine'),
    ByteUtils = require('./../utils/byte-utils');

var SalsaNonce = [0xe8, 0x30, 0x09, 0x4b, 0x97, 0x20, 0x5d, 0x2a];

/**
 * Protect information used for decrypt and encrypt protected data fields
 * @constructor
 */
var ProtectSaltGenerator = function (algo) {
    this.algo = algo;
};

/**
 * Get salt bytes
 * @param {number} len - bytes count
 * @return {ArrayBuffer} - salt bytes
 */
ProtectSaltGenerator.prototype.getSalt = function (len) {
    return ByteUtils.arrayToBuffer(this.algo.getBytes(len));
};

/**
 * Creates protected salt generator
 * @param {ArrayBuffer|Uint8Array} key
 * @param {Number} crsAlgorithm
 * @return {Promise.<ProtectedSaltGenerator>}
 */
ProtectSaltGenerator.create = function (key, crsAlgorithm) {
    switch (crsAlgorithm) {
        case Consts.CrsAlgorithm.Salsa20:
            return CryptoEngine.sha256(ByteUtils.arrayToBuffer(key)).then(function (hash) {
                var key = new Uint8Array(hash);
                var algo = new Salsa20(key, SalsaNonce);
                return new ProtectSaltGenerator(algo);
            });
        case Consts.CrsAlgorithm.ChaCha20:
            return CryptoEngine.sha512(ByteUtils.arrayToBuffer(key)).then(function (hash) {
                var key = new Uint8Array(hash, 0, 32);
                var nonce = new Uint8Array(hash, 32, 12);
                var algo = new ChaCha20(key, nonce);
                return new ProtectSaltGenerator(algo);
            });
        default:
            return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'crsAlgorithm'));
    }
};

module.exports = ProtectSaltGenerator;
