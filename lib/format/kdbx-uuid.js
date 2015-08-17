'use strict';

var ByteUtils = require('../utils/byte-utils');

/**
 * Uuid for passwords
 * @param {ArrayBuffer} ab - ArrayBuffer with data
 * @constructor
 */
function KdbxUuid(ab) {
    if (ab === undefined) {
        ab = new ArrayBuffer(16);
    }
    this.id = ab.byteLength === 16 ? ByteUtils.bytesToBase64(ab) : undefined;
    this.empty = true;
    if (ab) {
        var bytes = new Uint8Array(ab);
        for (var i = 0, len = bytes.length; i < len; i++) {
            if (bytes[i] !== 0) {
                this.empty = false;
                return;
            }
        }
    }
}

Object.defineProperty(KdbxUuid.prototype, 'bytes', {
    enumerable: true,
    get: function() {
        return ByteUtils.base64ToBytes(this.id);
    }
});

KdbxUuid.prototype.toString = function() {
    return this.id;
};

KdbxUuid.prototype.valueOf = function() {
    return this.id;
};

KdbxUuid.prototype.toBytes = function() {
    return this.id ? ByteUtils.base64ToBytes(this.id) : undefined;
};

module.exports = KdbxUuid;
