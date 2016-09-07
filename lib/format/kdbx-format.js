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
    KeyEncryptor = require('../crypto/key-encryptor');

var KdbxFormat = function(kdbx) {
    this.kdbx = kdbx;
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @returns {Promise<Kdbx>}
 */
KdbxFormat.prototype.read = function(data) {
    var stm = new BinaryStream(data);
    var kdbx = this.kdbx;
    var that = this;
    return kdbx.credentials.ready.then(function() {
        kdbx.header = KdbxHeader.read(stm);
        return that._decryptXml(kdbx, stm).then(function(xmlStr) {
            kdbx.xml = XmlUtils.parse(xmlStr);
            return that._setProtectedValues().then(function() {
                kdbx._loadFromXml();
                return that._checkHeaderHash(stm).then(function() {
                    return kdbx;
                });
            });
        });
    });
};

KdbxFormat.prototype._decryptXml = function(kdbx, stm) {
    var data = stm.readBytesToEnd();
    var that = this;
    return that._getMasterKey().then(function(masterKey) {
        var aesCbc = CryptoEngine.createAesCbc();
        return aesCbc.importKey(masterKey).then(function() {
            return aesCbc.decrypt(data, kdbx.header.encryptionIV).then(function(data) {
                ByteUtils.zeroBuffer(masterKey);
                data = that._trimStartBytes(data);
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

// KdbxFormat.prototype._encryptXml = function(callback) {
//     var xml = this._serializeXml();
//     var data = ByteUtils.arrayToBuffer(ByteUtils.stringToBytes(xml));
//     if (this.header.compression === Consts.CompressionAlgorithm.GZip) {
//         data = pako.gzip(data);
//     }
//
//     data = HashedBlockTransform.encrypt(ByteUtils.arrayToBuffer(data));
//
//     var ssb = new Uint8Array(this.header.streamStartBytes);
//     var newData = new Uint8Array(data.byteLength + ssb.length);
//     newData.set(ssb);
//     newData.set(new Uint8Array(data), ssb.length);
//     data = newData;
//     var encryptionIV = this.header.encryptionIV;
//     this._getMasterKey(function(masterKey) {
//         data = ByteUtils.arrayToBuffer(asmCrypto.AES_CBC.encrypt(data, masterKey, true, encryptionIV));
//         ByteUtils.zeroBuffer(masterKey);
//         callback(data);
//     });
// };

KdbxFormat.prototype._getMasterKey = function() {
    var kdbx = this.kdbx;
    return kdbx.credentials.getHash().then(function(credHash) {
        var transformSeed = kdbx.header.transformSeed;
        var transformRounds = kdbx.header.keyEncryptionRounds;
        var masterSeed = kdbx.header.masterSeed;

        return KeyEncryptor.encrypt(new Uint8Array(credHash), transformSeed, transformRounds).then(function(encKey) {
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

KdbxFormat.prototype._trimStartBytes = function(data) {
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


KdbxFormat.prototype._checkHeaderHash = function(stm) {
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

KdbxFormat.prototype._getHeaderHash = function(stm) {
    var src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
    return CryptoEngine.sha256(src);
};

module.exports = KdbxFormat;
