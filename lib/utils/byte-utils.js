'use strict';

var textEncoding = require('text-encoding');

var textEncoder = new textEncoding.TextEncoder();
var textDecoder = new textEncoding.TextDecoder();

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
    return textDecoder.decode(arr);
}

/**
 * Converts string to byte array
 * @param {string} str
 * @return {Uint8Array}
 */
function stringToBytes(str) {
    return textEncoder.encode(str);
}

/**
 * Converts base64 string to array
 * @param {string} str
 * @return {Uint8Array}
 */
function base64ToBytes(str) {
    if (typeof atob === 'undefined' && typeof Buffer === 'function') {
        // node.js doesn't have atob
        var buffer = new Buffer(str, 'base64');
        return new Uint8Array(buffer);
    }
    return stringToBytes(atob(str));
}

/**
 * Converts Array or ArrayBuffer to base64-string
 * @param {Array|Uint8Array|ArrayBuffer} arr
 * @return {string}
 */
function bytesToBase64(arr) {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    if (typeof btoa === 'undefined' && typeof Buffer === 'function') {
        // node.js doesn't have btoa
        var buffer = new Buffer(arr);
        return buffer.toString('base64');
    }
    return btoa(bytesToString(arr));
}

/**
 * Convert hex-string to byte array
 * @param {string} hex
 * @return Uint8Array
 */
function hexToBytes(hex) {
    var arr = new Uint8Array(Math.ceil(hex.length / 2));
    for (var i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return arr;
}

/**
 * Convert hex-string to byte array
 * @param {Array|Uint8Array|ArrayBuffer} arr
 * @return {string}
 */
function bytesToHex(arr) {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    var str = '';
    for (var i = 0; i < arr.length; i++) {
        var byte = arr[i].toString(16);
        if (byte.length === 1) {
            str += '0';
        }
        str += byte;
    }
    return str;
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
module.exports.hexToBytes = hexToBytes;
module.exports.bytesToHex = bytesToHex;
module.exports.arrayToBuffer = arrayToBuffer;
module.exports.zeroBuffer = zeroBuffer;
