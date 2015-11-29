'use strict';

var ByteUtils = require('../utils/byte-utils'),
    Random = require('../crypto/random');

var UuidLength = 16;

/**
 * Uuid for passwords
 * @param {ArrayBuffer|string} ab - ArrayBuffer with data
 * @constructor
 */
function KdbxUuid(ab) {
    if (ab === undefined) {
        ab = new ArrayBuffer(UuidLength);
    }
    if (typeof ab === 'string') {
        ab = ByteUtils.base64ToBytes(ab);
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

/**
 * Checks whether two uuids are equal
 * @param {KdbxUuid|string} other
 */
KdbxUuid.prototype.equals = function(other) {
    return other && other.toString() === this.toString() || false;
};

Object.defineProperty(KdbxUuid.prototype, 'bytes', {
    enumerable: true,
    get: function() {
        return ByteUtils.base64ToBytes(this.id);
    }
});

/**
 * Generated random uuid
 * @return {KdbxUuid}
 * @static
 */
KdbxUuid.random = function() {
    return new KdbxUuid(Random.getBytes(UuidLength));
};

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
