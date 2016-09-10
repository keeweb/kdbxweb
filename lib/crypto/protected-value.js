'use strict';

var ByteUtils = require('../utils/byte-utils'),
    CryptoEngine = require('./crypto-engine'),
    Random = require('./random');

/**
 * Protected value, used for protected entry fields
 * @param {ArrayBuffer} value - encrypted value
 * @param {ArrayBuffer} salt - salt bytes
 * @constructor
 */
var ProtectedValue = function(value, salt) {
    Object.defineProperty(this, '_value', { value: new Uint8Array(value) });
    Object.defineProperty(this, '_salt', { value: new Uint8Array(salt) });
};

/**
 * Returns protected value as base64 string
 * @returns {string}
 */
ProtectedValue.prototype.toString = function() {
    return ByteUtils.bytesToBase64(this._value);
};

/**
 * Creates protected value from string with new random salt
 * @param {string} str
 */
ProtectedValue.fromString = function(str) {
    var bytes = ByteUtils.stringToBytes(str),
        salt = Random.getBytes(bytes.length);
    for (var i = 0, len = bytes.length; i < len; i++) {
        bytes[i] ^= salt[i];
    }
    return new ProtectedValue(ByteUtils.arrayToBuffer(bytes), ByteUtils.arrayToBuffer(salt));
};

/**
 * Creates protected value from binary with new random salt
 * @param {ArrayBuffer} binary
 */
ProtectedValue.fromBinary = function(binary) {
    var bytes = new Uint8Array(binary),
        salt = Random.getBytes(bytes.length);
    for (var i = 0, len = bytes.length; i < len; i++) {
        bytes[i] ^= salt[i];
    }
    return new ProtectedValue(ByteUtils.arrayToBuffer(bytes), ByteUtils.arrayToBuffer(salt));
};

/**
 * Determines whether the value is included as substring (safe check; doesn't decrypt full string)
 * @param {string} str
 * @return {boolean}
 */
ProtectedValue.prototype.includes = function(str) {
    if (str.length === 0) {
        return false;
    }
    var source = this._value,
        salt = this._salt,
        search = ByteUtils.stringToBytes(str),
        sourceLen = source.length, searchLen = search.length, maxPos = sourceLen - searchLen,
        sourceIx, searchIx;
    src: for (sourceIx = 0; sourceIx <= maxPos; sourceIx++) {
        for (searchIx = 0; searchIx < searchLen; searchIx++) {
            if ((source[sourceIx + searchIx] ^ salt[sourceIx + searchIx]) !== search[searchIx]) {
                continue src;
            }
        }
        return true;
    }
    return false;
};

/**
 * Calculates SHA256 hash of saved value
 * @return {Promise.<ArrayBuffer>}
 */
ProtectedValue.prototype.getHash = function() {
    var binary = ByteUtils.arrayToBuffer(this.getBinary());
    return CryptoEngine.sha256(binary).then(function(hash) {
        ByteUtils.zeroBuffer(binary);
        return hash;
    });
};

/**
 * Decrypted text
 * @returns {string}
 */
ProtectedValue.prototype.getText = function() {
    return ByteUtils.bytesToString(this.getBinary());
};

/**
 * Decrypted binary. Don't forget to zero it after usage
 * @returns {Uint8Array}
 */
ProtectedValue.prototype.getBinary = function() {
    var value = this._value, salt = this._salt;
    var bytes = new Uint8Array(value.byteLength);
    for (var i = bytes.length - 1; i >= 0; i--) {
        bytes[i] = value[i] ^ salt[i];
    }
    return bytes;
};

/**
 * Sets new salt
 * @param {ArrayBuffer} newSalt
 */
ProtectedValue.prototype.setSalt = function(newSalt) {
    var newSaltArr = new Uint8Array(newSalt);
    var value = this._value, salt = this._salt;
    for (var i = 0, len = value.length; i < len; i++) {
        value[i] = value[i] ^ salt[i] ^ newSaltArr[i];
        salt[i] = newSaltArr[i];
    }
};

/**
 * Clones object
 * @return {ProtectedValue}
 */
ProtectedValue.prototype.clone = function() {
    return new ProtectedValue(this._value, this._salt);
};

/**
 * Value byte length
 */
Object.defineProperty(ProtectedValue.prototype, 'byteLength', {
    enumerable: true,
    get: function() {
        return this._value.byteLength;
    }
});

module.exports = ProtectedValue;
