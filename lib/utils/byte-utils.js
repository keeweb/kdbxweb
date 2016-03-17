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
    var arr1 = new Uint8Array(ab1);
    var arr2 = new Uint8Array(ab2);
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
    if (typeof atob === 'undefined' && typeof Buffer === 'function') {
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
    if (typeof btoa === 'undefined' && typeof Buffer === 'function') {
        // node.js doesn't have btoa
        var buffer = new Buffer(arr);
        return buffer.toString('base64');
    }
    return asmCrypto.bytes_to_base64(arr);
}

/**
 * Converts byte array to array buffer
 * @param {Uint8Array|ArrayBuffer} arr
 * @returns {ArrayBuffer}
 */
function arrayToBuffer(arr) {
    if (arr instanceof ArrayBuffer) {
        return arr;
    }
    var ab = arr.buffer;
    if (arr.byteOffset === 0 && arr.byteLength === ab.byteLength) {
        return ab;
    }
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

/**
 * Fills array or arrybuffer with zeroes
 * @param {Uint8Array|ArrayBuffer} buffer
 */
function zeroBuffer(buffer) {
    if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
    }
    for (var i = 0, len = buffer.length; i < len; i++) {
        buffer[i] = 0;
    }
}

module.exports.arrayBufferEquals = arrayBufferEquals;
module.exports.bytesToString = bytesToString;
module.exports.stringToBytes = stringToBytes;
module.exports.base64ToBytes = base64ToBytes;
module.exports.bytesToBase64 = bytesToBase64;
module.exports.arrayToBuffer = arrayToBuffer;
module.exports.zeroBuffer = zeroBuffer;
