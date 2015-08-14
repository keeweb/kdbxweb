'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils');

/**
 * Db metadata
 * @constructor
 */
var KdbxMeta = function() {
    this.generator = undefined;
    this.headerHash = undefined;
    this.name = undefined;
    this.nameChanged = undefined;
    this.desc = undefined;
    this.descChanged = undefined;
    this.defaultUser = undefined;
    this.defaultUserChanged = undefined;
    this.mntncHistoryDays = undefined;
    this.keyChanged = undefined;
    this.keyChangeRec = undefined;
    this.keyChangeForce = undefined;
    this.recycleBinEnabled = undefined;
    this.recycleBinUuid = undefined;
    this.recycleBinChanged = undefined;
    this.entryTemplatesGroup = undefined;
    this.entryTemplatesGroupChanged = undefined;
    this.historyMaxItems = undefined;
    this.historyMaxSize = undefined;
    this.lastSelectedGroup = undefined;
    this.lastTopVisibleGroup = undefined;
    this.memoryProtection = {
        title: undefined, userName: undefined, password: undefined, url: undefined, notes: undefined
    };
    this.binaries = {};
    this.customData = {};
    Object.preventExtensions(this);
};

KdbxMeta.prototype._readNode = function(node) {
    switch (node.tagName) {
        case XmlNames.Elem.Generator:
            this.generator = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.HeaderHash:
            this.headerHash = XmlUtils.getBytes(node);
            break;
        case XmlNames.Elem.DbName:
            this.name = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbNameChanged:
            this.nameChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbDesc:
            this.desc = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbDescChanged:
            this.descChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbDefaultUser:
            this.defaultUser = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbDefaultUserChanged:
            this.defaultUserChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbMntncHistoryDays:
            this.mntncHistoryDays = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.DbKeyChanged:
            this.keyChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbKeyChangeRec:
            this.keyChangeRec = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.DbKeyChangeForce:
            this.keyChangeForce = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.RecycleBinEnabled:
            this.recycleBinEnabled = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.RecycleBinUuid:
            this.recycleBinUuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.RecycleBinChanged:
            this.recycleBinChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.EntryTemplatesGroup:
            this.entryTemplatesGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.EntryTemplatesGroupChanged:
            this.entryTemplatesGroupChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.HistoryMaxItems:
            this.historyMaxItems = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.HistoryMaxSize:
            this.historyMaxSize = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.LastSelectedGroup:
            this.lastSelectedGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.LastTopVisibleGroup:
            this.lastTopVisibleGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.MemoryProt:
            this._readMemoryProtection(node);
            break;
        case XmlNames.Elem.Binaries:
            this._readBinaries(node);
            break;
        case XmlNames.Elem.CustomData:
            this._readCustomData(node);
            break;
    }
};

KdbxMeta.prototype._readMemoryProtection = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.ProtTitle:
                this.memoryProtection.title = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtUserName:
                this.memoryProtection.userName = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtPassword:
                this.memoryProtection.password = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtUrl:
                this.memoryProtection.url = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtNotes:
                this.memoryProtection.notes = XmlUtils.getBoolean(childNode);
                break;
        }
    }
};

KdbxMeta.prototype._readBinaries = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName === XmlNames.Elem.Binary) {
            this._readBinary(childNode);
        }
    }
};

KdbxMeta.prototype._readBinary = function(node) {
    var id = node.getAttribute(XmlNames.Attr.Id);
    //var ref = node.getAttribute(XmlNames.Attr.Ref);
    //var compressed = XmlUtils.strToBoolean(node.getAttribute(XmlNames.Attr.Compressed));
    var binary = XmlUtils.getProtectedBinary(node);
    if (id) {
        this.binaries[id] = binary;
    }
};

KdbxMeta.prototype._readCustomData = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName === XmlNames.Elem.StringDictExItem) {
            this._readCustomDataItem(childNode);
        }
    }
};

KdbxMeta.prototype._readCustomDataItem = function(node) {
    var key, value;
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Key:
                key = XmlUtils.getText(childNode);
                break;
            case XmlNames.Elem.Value:
                value = XmlUtils.getText(childNode);
                break;
        }
    }
    if (key) {
        this.customData[key] = value;
    }
};

/**
 * Read KdbxMeta from stream
 * @param {Node} xmlNode - xml Meta node
 * @return {KdbxMeta}
 */
KdbxMeta.read = function(xmlNode) {
    var meta = new KdbxMeta();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            meta._readNode(childNode);
        }
    }
    return meta;
};

module.exports = KdbxMeta;
