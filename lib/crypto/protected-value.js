'use strict';

var ByteUtils = require('../utils/byte-utils');

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
 * String representation (unsafe method; returns decrypted value)
 * @return {string} - decrypted text value
 */
ProtectedValue.prototype.toString = function() {
    return this.text;
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
 * Decrypted text (unsafe property; decrypts text)
 */
Object.defineProperty(ProtectedValue.prototype, 'text', {
    enumerable: true,
    get: function() {
        return ByteUtils.bytesToString(this.binary);
    }
});

/**
 * Decrypted binary (unsafe property; decrypts binary)
 */
Object.defineProperty(ProtectedValue.prototype, 'binary', {
    enumerable: true,
    get: function() {
        var value = this._value, salt = this._salt;
        var bytes = new Uint8Array(value.byteLength);
        for (var i = bytes.length - 1; i >= 0; i--) {
            bytes[i] = value[i] ^ salt[i];
        }
        return bytes;
    }
});

module.exports = ProtectedValue;
