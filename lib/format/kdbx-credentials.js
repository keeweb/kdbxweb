'use strict';

var xmldom = require('xmldom'),
    asmCrypto = require('asmcrypto.js'),
    ProtectedValue = require('../crypto/protected-value'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    XmlUtils = require('../utils/xml-utils'),
    Random = require('../crypto/random');

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

/**
 * Creates random keyfile
 * @returns {Uint8Array}
 */
KdbxCredentials.createRandomKeyFile = function() {
    var keyLength = 32;
    var keyBytes = Random.getBytes(keyLength),
        salt = Random.getBytes(keyLength);
    for (var i = 0; i < keyLength; i++) {
        keyBytes ^= salt;
        keyBytes ^= (Math.random() * 1000 % 255);
    }
    var key = ByteUtils.bytesToBase64(keyBytes);
    var xml = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<KeyFile>\n' +
        '    <Meta>\n' +
        '        <Version>1.00</Version>\n' +
        '    </Meta>\n' +
        '    <Key>\n' +
        '       <Data>' + key + '</Data>\n' +
        '   </Key>\n' +
        '</KeyFile>';
    return ByteUtils.stringToBytes(xml);
};

module.exports = KdbxCredentials;
