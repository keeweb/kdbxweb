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
    KdbxEntry = require('./kdbx-entry'),
    KdbxDeletedObject = require('./kdbx-deleted-object'),
    BinaryStream = require('./../utils/binary-stream'),
    Consts = require('./../defs/consts'),
    XmlNames = require('./../defs/xml-names'),
    HashedBlockTransform = require('./../crypto/hashed-block-transform'),
    ByteUtils = require('./../utils/byte-utils'),
    XmlUtils = require('./../utils/xml-utils'),
    ProtectSaltGenerator = require('./../crypto/protect-salt-generator'),
    KeyEncryptor = require('../crypto/key-encryptor');

/**
 * Kdbx file (KeePass database v2)
 * @constructor
 */
var Kdbx = function() {
    this.header = undefined;
    this.credentials = undefined;
    this.meta = undefined;
    this.xml = undefined;
    this.groups = [];
    this.deletedObjects = [];
    Object.preventExtensions(this);
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @param {KdbxCredentials} credentials
 * @param {Function} callback (called with loaded Kdbx)
 */
Kdbx.load = function(data, credentials, callback) {
    if (!(data instanceof ArrayBuffer)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'data');
    }
    if (!(credentials instanceof KdbxCredentials)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials');
    }
    var stm = new BinaryStream(data);
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    kdbx._readHeader(stm);
    kdbx._decryptXml(stm, function(err) {
        if (err) {
            return callback(null, err);
        }
        try {
            kdbx._setProtectedValues();
            kdbx._loadFromXml();
            kdbx._checkHeaderHash(stm);
        } catch (err) {
            return callback(null, err);
        }
        callback(kdbx);
    });
};

/**
 * Creates new database
 * @returns {Kdbx}
 */
Kdbx.create = function(credentials, name) {
    if (!(credentials instanceof KdbxCredentials)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials');
    }
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    kdbx.header = KdbxHeader.create();
    kdbx.meta = KdbxMeta.create();
    kdbx.meta.name = name;
    kdbx.createDefaultGroup();
    kdbx.createRecycleBin();
    kdbx.meta.lastSelectedGroup = kdbx.getDefaultGroup().id;
    kdbx.meta.lastTopVisibleGroup = kdbx.getDefaultGroup().id;
    return kdbx;
};

/**
 * Creates default group, if it's not yet created
 */
Kdbx.prototype.createDefaultGroup = function() {
    if (this.groups.length) {
        return;
    }
    var defaultGroup = KdbxGroup.create(this.meta.name);
    defaultGroup.icon = Consts.Icons.FolderOpen;
    defaultGroup.expanded = true;
    this.groups.push(defaultGroup);
};

/**
 * Creates recycle bin, if it's not yet created
 */
Kdbx.prototype.createRecycleBin = function() {
    this.meta.recycleBinEnabled = true;
    if (this.meta.recycleBinUuid && this.getGroup(this.meta.recycleBinUuid)) {
        return;
    }
    var defGrp = this.getDefaultGroup();
    var recycleBin = KdbxGroup.create(Consts.Defaults.RecycleBinName, defGrp);
    recycleBin.icon = Consts.Icons.TrashBin;
    recycleBin.enableAutoType = false;
    recycleBin.enableSearching = false;
    this.meta.recycleBinUuid = recycleBin.uuid;
    defGrp.groups.push(recycleBin);
};

/**
 * Adds new group to group
 * @param {string} name - new group name
 * @param {KdbxGroup} group - parent group
 * @return {KdbxGroup}
 */
Kdbx.prototype.createGroup = function(group, name) {
    var subGroup = KdbxGroup.create(name, group);
    group.groups.push(subGroup);
    return subGroup;
};

/**
 * Adds new entry to group
 * @param {KdbxGroup} group - parent group
 * @return {KdbxEntry}
 */
Kdbx.prototype.createEntry = function(group) {
    var entry = KdbxEntry.create(this.meta, group);
    group.entries.push(entry);
    return entry;
};

/**
 * Gets default group
 * @returns {KdbxGroup}
 */
Kdbx.prototype.getDefaultGroup = function() {
    return this.groups[0];
};

/**
 * Get group by uuid
 * @param {KdbxUuid|string} uuid
 * @param {KdbxGroup} [parentGroup]
 * @return {KdbxGroup|undefined}
 */
Kdbx.prototype.getGroup = function(uuid, parentGroup) {
    var groups = parentGroup ? parentGroup.groups : this.groups;
    for (var i = 0; i < groups.length; i++) {
        if (groups[i].uuid.id === uuid.id) {
            return groups[i];
        }
        var res = this.getGroup(uuid, groups[i]);
        if (res) {
            return res;
        }
    }
};

/**
 * Save db to ArrayBuffer
 * @param {Function} callback (called with database file contents as ArrayBuffer)
 */
Kdbx.prototype.save = function(callback) {
    var stm = new BinaryStream();
    this._generateSalts();
    this._writeHeader(stm);
    this._setHeaderHash(stm);
    this._buildXml();
    this._updateProtectedValuesSalt();
    this._encryptXml(function(data) {
        stm.writeBytes(data);
        callback(stm.getWrittenBytes());
    });
};

/**
 * Save db to XML
 * @param {Function} callback (called with saved XML as string)
 */
Kdbx.prototype.saveXml = function(callback) {
    this._generateSalts();
    this._buildXml();
    this._unprotectValuesInXml(false);
    var xml = this._serializeXml();
    this._protectValuesInXml();
    callback(xml);
};

/**
 * Move object from one group to another
 * @param {KdbxEntry|KdbxGroup} object - object to be moved
 * @param {KdbxGroup} toGroup - target parent group
 */
Kdbx.prototype.move = function(object, toGroup) {
    var containerProp = object instanceof KdbxGroup ? 'groups' : 'entries';
    var fromContainer = object.parentGroup[containerProp];
    var ix = fromContainer.indexOf(object);
    if (ix < 0) {
        return;
    }
    fromContainer.splice(ix, 1);
    if (toGroup) {
        toGroup[containerProp].push(object);
    } else {
        var deletedObject = new KdbxDeletedObject();
        deletedObject.uuid = object.uuid;
        deletedObject.deletionTime = new Date();
        this.deletedObjects.push(deletedObject);
    }
    object.parentGroup = toGroup;
    object.times.locationChanged = new Date();
};

/**
 * Delete entry or group
 * Depending on settings, removes either to trash, or completely
 * @param {KdbxEntry|KdbxGroup} object - object to be deleted
 */
Kdbx.prototype.remove = function(object) {
    var toGroup = this.meta.recycleBinEnabled ? this.getGroup(this.meta.recycleBinUuid) : null;
    this.move(object, toGroup);
    // TODO: clean up binaries from the deleted object
};

Kdbx.prototype._generateSalts = function() {
    this.header.generateSalts();
};

Kdbx.prototype._readHeader = function(stm) {
    this.header = KdbxHeader.read(stm);
};

Kdbx.prototype._writeHeader = function(stm) {
    this.header.write(stm);
};

Kdbx.prototype._getMasterKey = function(callback) {
    var credHash = this.credentials.getHash(),
        transformSeed = this.header.transformSeed,
        transformRounds = this.header.keyEncryptionRounds,
        masterSeed = this.header.masterSeed;
    KeyEncryptor.encrypt(credHash, transformSeed, transformRounds, function(encKey) {
        ByteUtils.zeroBuffer(credHash);
        var keyHash = asmCrypto.SHA256.bytes(encKey);
        ByteUtils.zeroBuffer(encKey);
        var sha256 = new asmCrypto.SHA256().reset();
        var masterKey = ByteUtils.arrayToBuffer(sha256.process(masterSeed).process(keyHash).finish().result);
        ByteUtils.zeroBuffer(keyHash);
        setTimeout(callback.bind(null, masterKey), 0);
    });
};

Kdbx.prototype._decryptXml = function(stm, callback) {
    var data = stm.readBytesToEnd();
    this._getMasterKey((function(masterKey) {
        try {
            data = ByteUtils.arrayToBuffer(asmCrypto.AES_CBC.decrypt(data, masterKey, false, this.header.encryptionIV));
            ByteUtils.zeroBuffer(masterKey);
            data = this._trimStartBytes(data);
            data = HashedBlockTransform.decrypt(data);
            if (this.header.compression === Consts.CompressionAlgorithm.GZip) {
                data = pako.ungzip(data);
            }
            var xml = ByteUtils.bytesToString(data);
            this._parseXml(xml);
        } catch (err) {
            return callback(err);
        }
        callback();
    }).bind(this));
};

Kdbx.prototype._encryptXml = function(callback) {
    var xml = this._serializeXml();
    var data = ByteUtils.arrayToBuffer(ByteUtils.stringToBytes(xml));
    if (this.header.compression === Consts.CompressionAlgorithm.GZip) {
        data = pako.gzip(data);
    }

    data = HashedBlockTransform.encrypt(ByteUtils.arrayToBuffer(data));

    var ssb = new Uint8Array(this.header.streamStartBytes);
    var newData = new Uint8Array(data.byteLength + ssb.length);
    newData.set(ssb);
    newData.set(new Uint8Array(data), ssb.length);
    data = newData;
    var encryptionIV = this.header.encryptionIV;
    this._getMasterKey(function(masterKey) {
        data = ByteUtils.arrayToBuffer(asmCrypto.AES_CBC.encrypt(data, masterKey, true, encryptionIV));
        ByteUtils.zeroBuffer(masterKey);
        callback(data);
    });
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
        var actualHash = this._getHeaderHash(stm);
        if (!ByteUtils.arrayBufferEquals(metaHash, actualHash)) {
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'header hash mismatch');
        }
    }
};

Kdbx.prototype._setHeaderHash = function(stm) {
    this.meta.headerHash = this._getHeaderHash(stm);
};

Kdbx.prototype._getHeaderHash = function(stm) {
    return ByteUtils.arrayToBuffer(asmCrypto.SHA256.bytes(stm.readBytesNoAdvance(0, this.header.endPos)));
};

Kdbx.prototype._parseXml = function(xml) {
    var DOMParser = xmldom.DOMParser;
    xml = new DOMParser().parseFromString(xml);
    Object.defineProperty(this, 'xml', { value: xml, configurable: true });
};

Kdbx.prototype._serializeXml = function() {
    var XMLSerializer = xmldom.XMLSerializer;
    return new XMLSerializer().serializeToString(this.xml);
};

Kdbx.prototype._setProtectedValues = function() {
    XmlUtils.setProtectedValues(this.xml.documentElement, this._getProtectSaltGenerator());
};

Kdbx.prototype._updateProtectedValuesSalt = function() {
    XmlUtils.updateProtectedValuesSalt(this.xml.documentElement, this._getProtectSaltGenerator());
};

Kdbx.prototype._unprotectValuesInXml = function() {
    XmlUtils.unprotectValues(this.xml.documentElement);
};

Kdbx.prototype._protectValuesInXml = function() {
    XmlUtils.protectUnprotectedValues(this.xml.documentElement);
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
    this._resolveFieldRefs();
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

Kdbx.prototype._resolveFieldRefs = function() {
    for (var i = 0, len = this.groups.length; i < len; i++) {
        this._resolveGroupFieldRefs(this.groups[i]);
    }
};

Kdbx.prototype._resolveGroupFieldRefs = function(group) {
    var i, len;
    for (i = 0, len = group.groups.length; i < len; i++) {
        this._resolveGroupFieldRefs(group.groups[i]);
    }
    for (i = 0, len = group.entries.length; i < len; i++) {
        this._resolveEntryFieldRefs(group.entries[i]);
    }
};

Kdbx.prototype._resolveEntryFieldRefs = function(entry) {
    for (var binaries = Object.keys(entry.binaries), i = 0; i < binaries.length; i++) {
        var name = binaries[i], binary = entry.binaries[name];
        if (binary && binary.ref && this.meta.binaries[binary.ref]) {
            binary.value = this.meta.binaries[binary.ref];
        }
    }
};

Kdbx.prototype._buildXml = function() {
    var DOMParser = xmldom.DOMParser;
    var xml = new DOMParser().parseFromString('<?xml version="1.0" encoding="utf-8" standalone="yes"?>');
    XmlUtils.addChildNode(xml, XmlNames.Elem.DocNode);
    this.meta.write(xml.documentElement);
    var rootNode = XmlUtils.addChildNode(xml.documentElement, XmlNames.Elem.Root);
    this.groups.forEach(function(g) { g.write(rootNode); });
    var delObjNode = XmlUtils.addChildNode(rootNode, XmlNames.Elem.DeletedObjects);
    this.deletedObjects.forEach(function (d) { d.write(delObjNode); });
    Object.defineProperty(this, 'xml', {value: xml, configurable: true});
};

module.exports = Kdbx;
