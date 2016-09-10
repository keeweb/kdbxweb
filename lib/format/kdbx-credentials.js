'use strict';

var ProtectedValue = require('../crypto/protected-value'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    XmlUtils = require('../utils/xml-utils'),
    Random = require('../crypto/random'),
    CryptoEngine = require('../crypto/crypto-engine');

/**
 * Credentials
 * @param {ProtectedValue} password
 * @param {String|ArrayBuffer|Uint8Array} [keyFile]
 * @constructor
 */
var KdbxCredentials = function(password, keyFile) {
    var that = this;
    this.ready = Promise.all([
        this.setPassword(password),
        this.setKeyFile(keyFile)
    ]).then(function() {
        return that;
    });
};

/**
 * Set password
 * @param {ProtectedValue|null} password
 */
KdbxCredentials.prototype.setPassword = function(password) {
    if (password === null) {
        this.passwordHash = null;
    } else if (!(password instanceof ProtectedValue)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'password'));
    } else {
        var that = this;
        return password.getHash().then(function(hash) {
            that.passwordHash = ProtectedValue.fromBinary(hash);
        });
    }
    return Promise.resolve();
};

/**
 * Set keyfile
 * @param {ArrayBuffer|Uint8Array} [keyFile]
 */
KdbxCredentials.prototype.setKeyFile = function(keyFile) {
    if (keyFile && !(keyFile instanceof ArrayBuffer) && !(keyFile instanceof Uint8Array)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'keyFile'));
    }
    if (keyFile) {
        if (keyFile.byteLength === 32) {
            this.keyFileHash = ProtectedValue.fromBinary(ByteUtils.arrayToBuffer(keyFile));
            return Promise.resolve();
        }
        try {
            var keyFileStr;
            keyFileStr = ByteUtils.bytesToString(ByteUtils.arrayToBuffer(keyFile));
            if (keyFileStr.match(/^[a-f\d]{64}$/i)) {
                var bytes = ByteUtils.hexToBytes(keyFileStr);
                this.keyFileHash = ProtectedValue.fromBinary(bytes);
                return;
            }
            var xml = XmlUtils.parse(keyFileStr.trim());
            var keyEl = XmlUtils.getChildNode(xml.documentElement, 'Key');
            var dataEl = XmlUtils.getChildNode(keyEl, 'Data');
            this.keyFileHash = ProtectedValue.fromBinary(ByteUtils.base64ToBytes(dataEl.textContent));
        } catch (e) {
            var that = this;
            return CryptoEngine.sha256(keyFile).then(function(hash) {
                that.keyFileHash = ProtectedValue.fromBinary(hash);
            });
        }
    } else {
        this.keyFileHash = null;
    }
    return Promise.resolve();
};

/**
 * Get credentials hash
 * @returns {Promise.<ArrayBuffer>}
 */
KdbxCredentials.prototype.getHash = function() {
    var that = this;
    return this.ready.then(function() {
        var buffers = [];
        if (that.passwordHash) {
            buffers.push(that.passwordHash.getBinary());
        }
        if (that.keyFileHash) {
            buffers.push(that.keyFileHash.getBinary());
        }
        var totalLength = buffers.reduce(function (acc, buf) {
            return acc + buf.byteLength;
        }, 0);
        var allBytes = new Uint8Array(totalLength);
        var offset = 0;
        buffers.forEach(function (buffer) {
            allBytes.set(buffer, offset);
            ByteUtils.zeroBuffer(buffer);
            offset += buffer.length;
        });
        return CryptoEngine.sha256(ByteUtils.arrayToBuffer(allBytes)).then(function (hash) {
            ByteUtils.zeroBuffer(allBytes);
            return hash;
        });
    });
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
