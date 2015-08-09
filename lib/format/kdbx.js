'use strict';

require('arraybuffer-slice');

var
    asmCrypto = require('asmcrypto.js'),
    pako = require('pako'),
    xmldom = require('xmldom'),

    KdbxError = require('./../errors/kdbx-error'),
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
    ProtectSaltGenerator = require('./../crypto/protect-salt-generator');

/**
 * Kdbx file (KeePass database v2)
 * @constructor
 */
var Kdbx = function() {
};

/**
 * Save db to ArrayBuffer
 * @return {ArrayBuffer} saved db
 */
Kdbx.prototype.save = function() {
    throw new KdbxError(KdbxError.Codes.NotImplemented);
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @param {string} password - master password
 * @param {ArrayBuffer} [keyFile] - key file contents, if any
 * @return {Kdbx} - loaded Kdbx file
 */
Kdbx.load = function(data, password, keyFile) {
    if (!(data instanceof ArrayBuffer)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'data');
    }
    if (typeof password !== 'string') {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'password');
    }
    if (keyFile && !(keyFile instanceof ArrayBuffer)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'keyFile');
    }
    var stm = new BinaryStream(data);
    var kdbx = new Kdbx();
    kdbx._readSignature(stm);
    kdbx._readVersion(stm);
    kdbx._readHeader(stm);
    kdbx._buildMasterKey(password, keyFile);
    kdbx._readXml(stm);
    kdbx._setProtectedValuesSalt();
    kdbx._loadFromXml();
    kdbx._checkHeaderHash(stm);
    return kdbx;
};

Kdbx.prototype._readSignature = function(stm) {
    var sig1 = stm.getUint32(true), sig2 = stm.getUint32(true);
    var FileSignature1 = 0x9AA2D903, FileSignature2 = 0xB54BFB67;
    if (!(sig1 === FileSignature1 && sig2 === FileSignature2)) {
        throw new KdbxError(Consts.ErrorCodes.BadSignature);
    }
};

Kdbx.prototype._readVersion = function(stm) {
    var FileVersionCriticalMask = 0xFFFF0000, FileVersion32 = 0x00030001;
    var version = stm.getUint32(true);
    if ((version & FileVersionCriticalMask) > (FileVersion32 & FileVersionCriticalMask)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidVersion);
    }
};

Kdbx.prototype._readHeader = function(stm) {
    this.header = KdbxHeader.read(stm);
};

Kdbx.prototype._buildMasterKey = function(password, keyFile) {
    var sha256 = new asmCrypto.SHA256().reset();
    sha256.process(asmCrypto.SHA256.bytes(password));
    if (keyFile) {
        sha256.process(asmCrypto.SHA256.bytes(keyFile));
    }
    var key = sha256.finish().result,
        transformSeed = this.header.transformSeed,
        transformRounds = this.header.keyEncryptionRounds,
        aes = asmCrypto.AES_ECB;
    while (transformRounds--) {
        key = aes.encrypt(key, transformSeed, false, null);
    }
    var keyHash = asmCrypto.SHA256.bytes(key);
    sha256 = new asmCrypto.SHA256().reset();
    this.masterKey = sha256.process(this.header.masterSeed).process(keyHash).finish().result.buffer;
};

Kdbx.prototype._readXml = function(stm) {
    var data = stm.readBytesToEnd();
    data = asmCrypto.AES_CBC.decrypt(data, this.masterKey, false, this.header.encryptionIV).buffer;

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
        var actualHash = asmCrypto.SHA256.bytes(stm.readBytesNoAdvance(0, this.header.endPos)).buffer;
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
