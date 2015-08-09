'use strict';

var asmCrypto = require('asmcrypto.js');

/**
 * Checks if two ArrayBuffers are equal
 * @param {ArrayBuffer} ab1
 * @param {ArrayBuffer} ab2
 * @returns {boolean}
 */
function arrayBufferEquals(ab1, ab2) {
    if (ab1.byteLength !== ab2.byteLength) {
        return false;
    }
    var arr1 = new Int8Array(ab1);
    var arr2 = new Int8Array(ab2);
    for (var i = 0, len = arr1.length; i < len; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Converts Array or ArrayBuffer to string
 * @param {Array|Uint8Array|ArrayBuffer} arr
 * @return {string}
 */
function bytesToString(arr) {
    /* jshint camelcase:false */
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    return asmCrypto.bytes_to_string(arr, true);
}

/**
 * Converts string to byte array
 * @param {string} str
 * @return {Uint8Array}
 */
function stringToBytes(str) {
    /* jshint camelcase:false */
    return asmCrypto.string_to_bytes(str, true);
}

/**
 * Converts base64 string to array
 * @param {string} str
 * @return {Uint8Array}
 */
function base64ToBytes(str) {
    /* jshint camelcase:false */
    if (typeof atob === 'undefined') {
        // node.js doesn't have atob
        var buffer = new Buffer(str, 'base64');
        return new Uint8Array(buffer);
    }
    return asmCrypto.base64_to_bytes(str);
}

/**
 * Converts Array or ArrayBuffer to base64-string
 * @param {Array|Uint8Array|ArrayBuffer} arr
 * @return {string}
 */
function bytesToBase64(arr) {
    /* jshint camelcase:false */
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    if (typeof btoa === 'undefined') {
        // node.js doesn't have btoa
        var buffer = new Buffer(arr);
        return buffer.toString('base64');
    }
    return asmCrypto.bytes_to_base64(arr);
}

module.exports.arrayBufferEquals = arrayBufferEquals;
module.exports.bytesToString = bytesToString;
module.exports.stringToBytes = stringToBytes;
module.exports.base64ToBytes = base64ToBytes;
module.exports.bytesToBase64 = bytesToBase64;
