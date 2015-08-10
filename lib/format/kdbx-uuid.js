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

module.exports = Uuid;
