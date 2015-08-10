'use strict';

var Salsa20 = require('./salsa20');

var key = new Uint8Array(32), nonce = new Uint8Array(8);
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
    algo.getBytes(Math.round(Math.random() * len) + 1);
    return algo.getBytes(len);
}

module.exports.getBytes = getBytes;
