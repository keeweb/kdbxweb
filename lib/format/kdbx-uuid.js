'use strict';

var ByteUtils = require('../utils/byte-utils');

/**
 * Uuid for passwords
 * @param {ArrayBuffer} ab - ArrayBuffer with data
 * @constructor
 */
function KdbxUuid(ab) {
    this.id = ab && ab.byteLength === 16 ? ByteUtils.bytesToBase64(ab) : undefined;
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
