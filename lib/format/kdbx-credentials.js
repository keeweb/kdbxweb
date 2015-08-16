'use strict';

var xmldom = require('xmldom'),
    asmCrypto = require('asmcrypto.js'),
    ProtectedValue = require('../crypto/protected-value'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    XmlUtils = require('../utils/xml-utils');

/**
 * Credentials
 * @param {ProtectedValue} password
 * @param {ProtectedValue} keyFile
 * @constructor
 */
var KdbxCredentials = function(password, keyFile) {
    if (!(password instanceof ProtectedValue)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'password');
    }
    if (keyFile && !(keyFile instanceof String) && !(keyFile instanceof ArrayBuffer) && !(keyFile instanceof Uint8Array)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'keyFile');
    }
    var bytes = password.getHash();
    var sha256 = new asmCrypto.SHA256().reset();
    sha256.process(bytes);
    ByteUtils.zeroBuffer(bytes);
    if (keyFile) {
        if (!(keyFile instanceof String)) {
            keyFile = ByteUtils.bytesToString(ByteUtils.arrayToBuffer(keyFile));
        }
        var DOMParser = xmldom.DOMParser;
        var xml = new DOMParser().parseFromString(keyFile);
        var keyEl = XmlUtils.getChildNode(xml.documentElement, 'Key');
        var dataEl = XmlUtils.getChildNode(keyEl, 'Data');
        bytes = ByteUtils.base64ToBytes(dataEl.textContent);
        sha256.process(bytes);
        ByteUtils.zeroBuffer(bytes);
    }
    var hash = sha256.finish().result;
    this.hash = ProtectedValue.fromBinary(hash);
    ByteUtils.zeroBuffer(hash);
};

module.exports = KdbxCredentials;
