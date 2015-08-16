'use strict';

var ByteUtils = require('../utils/byte-utils');

/**
 * Uuid for passwords
 * @param {ArrayBuffer} ab - ArrayBuffer with data
 * @constructor
 */
function Uuid(ab) {
    this.id = ab && ab.byteLength === 16 ? ByteUtils.bytesToBase64(ab) : undefined;
}

Object.defineProperty(Uuid.prototype, 'bytes', {
    enumerable: true,
    get: function() {
        return ByteUtils.base64ToBytes(this.id);
    }
});

Uuid.prototype.toString = function() {
    return this.id;
};

Uuid.prototype.valueOf = function() {
    return this.id;
};

module.exports = Uuid;
