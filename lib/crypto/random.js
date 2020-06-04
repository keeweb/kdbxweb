'use strict';

var Salsa20 = require('./salsa20'),
    CryptoEngine = require('./crypto-engine');

var key = new Uint8Array(32),
    nonce = new Uint8Array(8);
for (var i = 0; i < key.length; i++) {
    key[i] = Math.random() * 0xff;
}
for (var j = 0; j < nonce.length; j++) {
    nonce[i] = Math.random() * 0xff;
}
var algo = new Salsa20(key, nonce);

/**
 * Gets random bytes
 * @param {number} len - bytes count
 * @return {Uint8Array} - random bytes
 */
function getBytes(len) {
    if (!len) {
        return new Uint8Array(0);
    }
    algo.getBytes(Math.round(Math.random() * len) + 1);
    var result = algo.getBytes(len);
    var cryptoBytes = CryptoEngine.random(len);
    for (var i = cryptoBytes.length - 1; i >= 0; --i) {
        result[i] ^= cryptoBytes[i];
    }
    return result;
}

module.exports.getBytes = getBytes;
