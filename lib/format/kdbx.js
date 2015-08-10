'use strict';

require('arraybuffer-slice');

var
    asmCrypto = require('asmcrypto.js'),
    pako = require('pako'),
    xmldom = require('xmldom'),

    KdbxError = require('./../errors/kdbx-error'),
    KdbxCredentials = require('./kdbx-credentials'),
    KdbxHeader = require('./kdbx-header'),
    KdbxMeta = require('./kdbx-meta'),
    KdbxGroup = require('./kdbx-group'),
    KdbxDeletedObject = require('./kdbx-deleted-object'),
    BinaryStream = require('./../utils/binary-stream'),
    Consts = require('./../defs/consts'),
    XmlNames = require('./../defs/xml-names'),
    HashedBlockTransform = require('./../crypto/hashed-block-transform'),
    ByteUtils = require('./../utils/byte-utils'),
    XmlUtils = require('./../utils/xml-utils'),
    ProtectSaltGenerator = require('./../crypto/protect-salt-generator'),
    Random = require('./../crypto/random');

/**
 * Kdbx file (KeePass database v2)
 * @constructor
 */
var Kdbx = function() {
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @param {KdbxCredentials} credentials
 * @return {Kdbx} - loaded Kdbx file
 */
Kdbx.load = function(data, credentials) {
    if (!(data instanceof ArrayBuffer)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'data');
    }
    if (!(credentials instanceof KdbxCredentials)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials');
    }
    var stm = new BinaryStream(data);
    var kdbx = new Kdbx(credentials);
    kdbx.credentials = credentials;
    kdbx._readHeader(stm);
    kdbx._readXml(stm);
    kdbx._setProtectedValuesSalt();
    kdbx._loadFromXml();
    kdbx._checkHeaderHash(stm);
    return kdbx;
};

/**
 * Save db to ArrayBuffer
 * @return {ArrayBuffer} - database file contents
 */
Kdbx.prototype.save = function() {
    var stm = new BinaryStream();
    this._generateSalts();
    this._buildMasterKey();
    this._buildXml();
    this._setProtectedValuesSalt();
    this._writeXml();
    this._setHeaderHash();
    this._writeHeader(stm);
    throw new KdbxError(KdbxError.Codes.NotImplemented);
};

Kdbx.prototype._generateSalts = function() {
    this.header.masterSeed = Random.getBytes(32);
    this.header.transformSeed = Random.getBytes(32);
    this.header.encryptionIV = Random.getBytes(16);
    this.header.protectedStreamKey = Random.getBytes(32);
};

Kdbx.prototype._readHeader = function(stm) {
    this.header = KdbxHeader.read(stm);
};

Kdbx.prototype._writeHeader = function(stm) {
    this.header.write(stm);
};

Kdbx.prototype._getMasterKey = function() {
    var credHash = this.credentials.hash.getBinary(),
        key = credHash,
        transformSeed = this.header.transformSeed,
        transformRounds = this.header.keyEncryptionRounds,
        aes = asmCrypto.AES_ECB;
    while (transformRounds--) {
        key = aes.encrypt(key, transformSeed, false, null);
    }
    ByteUtils.zeroBuffer(credHash);
    var keyHash = asmCrypto.SHA256.bytes(key);
    ByteUtils.zeroBuffer(key);
    var sha256 = new asmCrypto.SHA256().reset();
    var masterKey = ByteUtils.arrayToBuffer(sha256.process(this.header.masterSeed).process(keyHash).finish().result);
    ByteUtils.zeroBuffer(keyHash);
    return masterKey;
};

Kdbx.prototype._readXml = function(stm) {
    var data = stm.readBytesToEnd();
    var masterKey = this._getMasterKey();
    data = ByteUtils.arrayToBuffer(asmCrypto.AES_CBC.decrypt(data, masterKey, false, this.header.encryptionIV));
    ByteUtils.zeroBuffer(masterKey);

    data = this._trimStartBytes(data);
    data = HashedBlockTransform.decrypt(data);
    if (this.header.compression === Consts.CompressionAlgorithm.GZip) {
        data = pako.ungzip(data);
    }
    var xml = ByteUtils.bytesToString(data);
    this._parseXml(xml);
};

Kdbx.prototype._trimStartBytes = function(data) {
    var ssb = this.header.streamStartBytes;
    if (data.byteLength < ssb.byteLength) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'short start bytes');
    }
    if (!ByteUtils.arrayBufferEquals(data.slice(0, this.header.streamStartBytes.byteLength), ssb)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidKey);
    }
    return data.slice(ssb.byteLength);
};

Kdbx.prototype._checkHeaderHash = function(stm) {
    if (this.meta.headerHash) {
        var metaHash = this.meta.headerHash;
        var actualHash = ByteUtils.arrayToBuffer(asmCrypto.SHA256.bytes(stm.readBytesNoAdvance(0, this.header.endPos)));
        if (!ByteUtils.arrayBufferEquals(metaHash, actualHash)) {
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'header hash mismatch');
        }
    }
};

Kdbx.prototype._parseXml = function(xml) {
    var DOMParser = xmldom.DOMParser;
    xml = new DOMParser().parseFromString(xml);
    Object.defineProperty(this, 'xml', { value: xml });
};

Kdbx.prototype._setProtectedValuesSalt = function() {
    XmlUtils.setProtectedValuesSalt(this.xml.documentElement, this._getProtectSaltGenerator());
};

Kdbx.prototype._getProtectSaltGenerator = function() {
    return new ProtectSaltGenerator(this.header.protectedStreamKey);
};

Kdbx.prototype._loadFromXml = function() {
    var doc = this.xml.documentElement;
    if (doc.tagName !== XmlNames.Elem.DocNode) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad xml root');
    }
    this._parseMeta();
    this._parseRoot();
};

Kdbx.prototype._parseMeta = function() {
    var node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Meta, 'no meta node');
    this.meta = KdbxMeta.read(node);
};

Kdbx.prototype._parseRoot = function() {
    this.groups = [];
    this.deletedObjects = [];
    var node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Root, 'no root node');
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Group:
                this._readGroup(childNode);
                break;
            case XmlNames.Elem.DeletedObjects:
                this._readDeletedObjects(childNode);
                break;
        }
    }
};

Kdbx.prototype._readDeletedObjects = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.DeletedObject:
                this.deletedObjects.push(KdbxDeletedObject.read(childNode));
                break;
        }
    }
};

Kdbx.prototype._readGroup = function(node) {
    this.groups.push(KdbxGroup.read(node));
};

module.exports = Kdbx;
