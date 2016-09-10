'use strict';

var pako = require('pako'),

    KdbxError = require('./../errors/kdbx-error'),
    KdbxHeader = require('./kdbx-header'),

    CryptoEngine = require('./../crypto/crypto-engine'),
    BinaryStream = require('./../utils/binary-stream'),
    ByteUtils = require('./../utils/byte-utils'),
    XmlUtils = require('./../utils/xml-utils'),
    Consts = require('./../defs/consts'),
    HashedBlockTransform = require('./../crypto/hashed-block-transform'),
    ProtectSaltGenerator = require('./../crypto/protect-salt-generator'),
    KeyEncryptorAes = require('../crypto/key-encryptor-aes'),
    KeyEncryptorKdf = require('../crypto/key-encryptor-kdf');

var KdbxFormat = function(kdbx) {
    this.kdbx = kdbx;
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @returns {Promise.<Kdbx>}
 */
KdbxFormat.prototype.load = function(data) {
    var stm = new BinaryStream(data);
    var kdbx = this.kdbx;
    var that = this;
    return kdbx.credentials.ready.then(function() {
        kdbx.header = KdbxHeader.read(stm);
        if (kdbx.header.versionMajor === 3) {
            return that._loadV3(stm);
        } else if (kdbx.header.versionMajor === 4) {
            return that._loadV4(stm);
        } else {
            throw new KdbxError(Consts.ErrorCodes.Unsupported, 'bad version: ' + kdbx.header.versionMajor);
        }
    });
};

KdbxFormat.prototype._loadV3 = function(stm) {
    var kdbx = this.kdbx;
    var that = this;
    return that._decryptXml(kdbx, stm).then(function(xmlStr) {
        kdbx.xml = XmlUtils.parse(xmlStr);
        return that._setProtectedValues().then(function() {
            kdbx._loadFromXml();
            return that._checkHeaderHashV3(stm).then(function() {
                return kdbx;
            });
        });
    });
};

KdbxFormat.prototype._loadV4 = function(stm) {
    var that = this;
    return that._getHeaderHash(stm).then(function(headerSha) {
        var expectedHeaderSha = stm.readBytes(headerSha.byteLength);
        if (!ByteUtils.arrayBufferEquals(expectedHeaderSha, headerSha)) {
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'header hash mismatch');
        }
        return that._computeKeysV4().then(function(keys) {
            console.log('keys' + '\n' + ByteUtils.bytesToHex(keys.cipherKey) + '\n' + ByteUtils.bytesToHex(keys.hmacKey));
            throw new KdbxError(Consts.ErrorCodes.NotImplemented, 'TODO');
        });
    });
};

/**
 * Load XML file
 * @param {string} xmlStr
 * @returns {Promise.<Kdbx>}
 */
KdbxFormat.prototype.loadXml = function(xmlStr) {
    var kdbx = this.kdbx;
    return kdbx.credentials.ready.then(function() {
        kdbx.header = KdbxHeader.create();
        kdbx.xml = XmlUtils.parse(xmlStr);
        XmlUtils.protectPlainValues(kdbx.xml.documentElement);
        kdbx._loadFromXml();
        return kdbx;
    });
};

KdbxFormat.prototype.save = function() {
    var kdbx = this.kdbx;
    var that = this;
    return kdbx.credentials.ready.then(function() {
        var stm = new BinaryStream();
        kdbx.header.generateSalts();
        kdbx.header.write(stm);
        return that._getHeaderHash(stm).then(function(headerHash) {
            kdbx.meta.headerHash = headerHash;
            kdbx._buildXml();
            return that._getProtectSaltGenerator().then(function(gen) {
                XmlUtils.updateProtectedValuesSalt(kdbx.xml.documentElement, gen);
                return that._encryptXml().then(function(data) {
                    stm.writeBytes(data);
                    return stm.getWrittenBytes();
                });
            });
        });
    });
};

KdbxFormat.prototype.saveXml = function() {
    var kdbx = this.kdbx;
    return kdbx.credentials.ready.then(function() {
        kdbx.header.generateSalts();
        kdbx._buildXml();
        XmlUtils.unprotectValues(kdbx.xml.documentElement);
        var xml = XmlUtils.serialize(kdbx.xml);
        XmlUtils.protectUnprotectedValues(kdbx.xml.documentElement);
        return xml;
    });
};

KdbxFormat.prototype._decryptXml = function(kdbx, stm) {
    var data = stm.readBytesToEnd();
    var that = this;
    return that._getMasterKeyV3().then(function(masterKey) {
        var aesCbc = CryptoEngine.createAesCbc();
        return aesCbc.importKey(masterKey).then(function() {
            return aesCbc.decrypt(data, kdbx.header.encryptionIV).then(function(data) {
                ByteUtils.zeroBuffer(masterKey);
                data = that._trimStartBytesV3(data);
                return HashedBlockTransform.decrypt(data).then(function(data) {
                    if (that.kdbx.header.compression === Consts.CompressionAlgorithm.GZip) {
                        data = pako.ungzip(data);
                    }
                    return ByteUtils.bytesToString(data);
                });
            });
        });
    });
};

KdbxFormat.prototype._encryptXml = function() {
    var kdbx = this.kdbx;
    var that = this;
    var xml = XmlUtils.serialize(kdbx.xml);
    var data = ByteUtils.arrayToBuffer(ByteUtils.stringToBytes(xml));
    if (kdbx.header.compression === Consts.CompressionAlgorithm.GZip) {
        data = pako.gzip(data);
    }
    return HashedBlockTransform.encrypt(ByteUtils.arrayToBuffer(data)).then(function(data) {
        var ssb = new Uint8Array(kdbx.header.streamStartBytes);
        var newData = new Uint8Array(data.byteLength + ssb.length);
        newData.set(ssb);
        newData.set(new Uint8Array(data), ssb.length);
        data = newData;
        return that._getMasterKeyV3().then(function(masterKey) {
            var aesCbc = CryptoEngine.createAesCbc();
            return aesCbc.importKey(masterKey).then(function() {
                return aesCbc.encrypt(data, kdbx.header.encryptionIV).then(function(data) {
                    ByteUtils.zeroBuffer(masterKey);
                    return data;
                });
            });
        });
    });
};

KdbxFormat.prototype._getMasterKeyV3 = function() {
    var kdbx = this.kdbx;
    return kdbx.credentials.getHash().then(function(credHash) {
        var transformSeed = kdbx.header.transformSeed;
        var transformRounds = kdbx.header.keyEncryptionRounds;
        var masterSeed = kdbx.header.masterSeed;

        return KeyEncryptorAes.encrypt(new Uint8Array(credHash), transformSeed, transformRounds).then(function(encKey) {
            ByteUtils.zeroBuffer(credHash);
            return CryptoEngine.sha256(encKey).then(function(keyHash) {
                ByteUtils.zeroBuffer(encKey);
                var all = new Uint8Array(masterSeed.byteLength + keyHash.byteLength);
                all.set(new Uint8Array(masterSeed), 0);
                all.set(new Uint8Array(keyHash), masterSeed.byteLength);
                ByteUtils.zeroBuffer(keyHash);
                ByteUtils.zeroBuffer(masterSeed);
                return CryptoEngine.sha256(all.buffer).then(function(masterKey) {
                    ByteUtils.zeroBuffer(all.buffer);
                    return masterKey;
                });
            });
        });
    });
};

KdbxFormat.prototype._trimStartBytesV3 = function(data) {
    var ssb = this.kdbx.header.streamStartBytes;
    if (data.byteLength < ssb.byteLength) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'short start bytes');
    }
    if (!ByteUtils.arrayBufferEquals(data.slice(0, this.kdbx.header.streamStartBytes.byteLength), ssb)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidKey);
    }
    return data.slice(ssb.byteLength);
};

KdbxFormat.prototype._setProtectedValues = function() {
    var kdbx = this.kdbx;
    return this._getProtectSaltGenerator().then(function(gen) {
        XmlUtils.setProtectedValues(kdbx.xml.documentElement, gen);
    });
};

KdbxFormat.prototype._getProtectSaltGenerator = function() {
    return new ProtectSaltGenerator(this.kdbx.header.protectedStreamKey).ready;
};

KdbxFormat.prototype._getHeaderHash = function(stm) {
    var src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
    return CryptoEngine.sha256(src);
};

KdbxFormat.prototype._checkHeaderHashV3 = function(stm) {
    if (this.kdbx.meta.headerHash) {
        var metaHash = this.kdbx.meta.headerHash;
        return this._getHeaderHash(stm).then(function(actualHash) {
            if (!ByteUtils.arrayBufferEquals(metaHash, actualHash)) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'header hash mismatch');
            }
        });
    } else {
        return Promise.resolve();
    }
};

KdbxFormat.prototype._computeKeysV4 = function() {
    var that = this;
    var masterSeed = that.kdbx.header.masterSeed;
    if (!masterSeed || masterSeed.byteLength !== 32) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad master seed'));
    }
    var kdfParams = that.kdbx.header.kdfParameters;
    return that.kdbx.credentials.getHash().then(function(credHash) {
        return KeyEncryptorKdf.encrypt(credHash, kdfParams).then(function (encKey) {
            ByteUtils.zeroBuffer(credHash);
            if (!encKey || encKey.byteLength !== 32) {
                return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'bad derived key'));
            }
            var keyWithSeed = new Uint8Array(masterSeed.byteLength + encKey.byteLength);
            keyWithSeed.set(new Uint8Array(masterSeed), 0);
            keyWithSeed.set(new Uint8Array(encKey), masterSeed.byteLength);
            ByteUtils.zeroBuffer(encKey);
            ByteUtils.zeroBuffer(masterSeed);
            return Promise.all([
                KeyEncryptorKdf.resizeKey(keyWithSeed.buffer, 64),
                CryptoEngine.sha512(keyWithSeed.buffer)
            ]).then(function (keys) {
                ByteUtils.zeroBuffer(keyWithSeed);
                return { cipherKey: keys[0], hmacKey: keys[1] };
            });
        });
    });
};

module.exports = KdbxFormat;
