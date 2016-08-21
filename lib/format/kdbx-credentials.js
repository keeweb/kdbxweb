'use strict';

var asmCrypto = require('asmcrypto.js'),
    ProtectedValue = require('../crypto/protected-value'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    XmlUtils = require('../utils/xml-utils'),
    Random = require('../crypto/random');

/**
 * Credentials
 * @param {ProtectedValue} password
 * @param {String|ArrayBuffer|Uint8Array} [keyFile]
 * @constructor
 */
var KdbxCredentials = function(password, keyFile) {
    this.setPassword(password);
    this.setKeyFile(keyFile);
};

/**
 * Set password
 * @param {ProtectedValue|null} password
 */
KdbxCredentials.prototype.setPassword = function(password) {
    if (password === null) {
        this.passwordHash = null;
    } else if (!(password instanceof ProtectedValue)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'password');
    } else {
        var hash = password.getHash();
        this.passwordHash = ProtectedValue.fromBinary(hash);
        ByteUtils.zeroBuffer(hash);
    }
};

/**
 * Set keyfile
 * @param {String|ArrayBuffer|Uint8Array} [keyFile]
 */
KdbxCredentials.prototype.setKeyFile = function(keyFile) {
    if (keyFile && !(keyFile instanceof String) && !(keyFile instanceof ArrayBuffer) && !(keyFile instanceof Uint8Array)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'keyFile');
    }
    if (keyFile) {
        if (keyFile.byteLength === 32) {
            this.keyFileHash = ProtectedValue.fromBinary(ByteUtils.arrayToBuffer(keyFile));
            return;
        }
        try {
            var keyFileStr;
            if (!(keyFile instanceof String)) {
                keyFileStr = ByteUtils.bytesToString(ByteUtils.arrayToBuffer(keyFile));
            }
            if (keyFileStr.match(/^[a-z\d]{64}$/i)) {
                var bytes = this.keyHexToBytes(keyFileStr);
                this.keyFileHash = ProtectedValue.fromBinary(bytes);
                return;
            }
            var xml = XmlUtils.parse(keyFileStr);
            var keyEl = XmlUtils.getChildNode(xml.documentElement, 'Key');
            var dataEl = XmlUtils.getChildNode(keyEl, 'Data');
            this.keyFileHash = ProtectedValue.fromBinary(ByteUtils.base64ToBytes(dataEl.textContent));
        } catch (e) {
            var sha256 = new asmCrypto.SHA256().reset();
            sha256.process(keyFile);
            var hash = sha256.finish().result;
            this.keyFileHash = ProtectedValue.fromBinary(hash);
            ByteUtils.zeroBuffer(hash);
        }
    } else {
        this.keyFileHash = null;
    }
};

KdbxCredentials.prototype.keyHexToBytes = function(str) {
    var result = new Uint8Array(32);
    for (var i = 0; i < str.length; i += 2) {
        var ch = str[i];
        var byte;

        if ((ch >= '0') && (ch <= '9')) {
            byte = (ch.charCodeAt(0) - '0'.charCodeAt(0));
        } else if ((ch >= 'a') && (ch <= 'f')) {
            byte = (ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        } else if ((ch >= 'A') && (ch <= 'F')) {
            byte = (ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10);
        } else {
            byte = 0;
        }

        byte <<= 4;

        ch = str[i + 1];
        if ((ch >= '0') && (ch <= '9')) {
            byte += (ch.charCodeAt(0) - '0'.charCodeAt(0));
        } else if ((ch >= 'a') && (ch <= 'f')) {
            byte += (ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        } else if ((ch >= 'A') && (ch <= 'F')) {
            byte += (ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10);
        }
        result[i / 2] = byte;
    }
    return result.buffer;
};

/**
 * Get credentials hash
 * @returns {ArrayBuffer}
 */
KdbxCredentials.prototype.getHash = function() {
    var sha256 = new asmCrypto.SHA256().reset();
    if (this.passwordHash) {
        var passBytes = this.passwordHash.getBinary();
        sha256.process(passBytes);
        ByteUtils.zeroBuffer(passBytes);
    }
    if (this.keyFileHash) {
        var hashBytes = this.keyFileHash.getBinary();
        sha256.process(hashBytes);
        ByteUtils.zeroBuffer(hashBytes);
    }
    return sha256.finish().result;
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
        keyBytes[i] ^= salt[i];
        keyBytes[i] ^= (Math.random() * 1000 % 255);
    }
    var key = ByteUtils.bytesToBase64(keyBytes);
    return KdbxCredentials.createKeyFileWithHash(key);
};

/**
 * Creates keyfile by given hash
 * @param {string} hash base64-encoded hash
 * @returns {Uint8Array}
 */
KdbxCredentials.createKeyFileWithHash = function(hash) {
    var xml = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<KeyFile>\n' +
        '    <Meta>\n' +
        '        <Version>1.00</Version>\n' +
        '    </Meta>\n' +
        '    <Key>\n' +
        '       <Data>' + hash + '</Data>\n' +
        '   </Key>\n' +
        '</KeyFile>';
    return ByteUtils.stringToBytes(xml);
};

module.exports = KdbxCredentials;
