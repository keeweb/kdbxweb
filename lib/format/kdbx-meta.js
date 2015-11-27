'use strict';

var XmlNames = require('./../defs/xml-names'),
    KdbxUuid = require('./kdbx-uuid'),
    XmlUtils = require('./../utils/xml-utils'),
    Consts = require('./../defs/consts');

var Constants = {
    Generator: 'KdbxWeb'
};

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
    this.color = undefined;
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
    this.customIcons = {};
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
            this.defaultUser = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbDefaultUserChanged:
            this.defaultUserChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbMntncHistoryDays:
            this.mntncHistoryDays = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.DbColor:
            this.color = XmlUtils.getText(node);
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
        case XmlNames.Elem.CustomIcons:
            this._readCustomIcons(node);
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

KdbxMeta.prototype._writeMemoryProtection = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.MemoryProt);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtTitle), this.memoryProtection.title);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtUserName), this.memoryProtection.userName);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtPassword), this.memoryProtection.password);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtUrl), this.memoryProtection.url);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtNotes), this.memoryProtection.notes);
};

KdbxMeta.prototype._readCustomIcons = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName === XmlNames.Elem.CustomIconItem) {
            this._readCustomIcon(childNode);
        }
    }
};

KdbxMeta.prototype._readCustomIcon = function(node) {
    var uuid, data;
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.CustomIconItemID:
                uuid = XmlUtils.getUuid(childNode);
                break;
            case XmlNames.Elem.CustomIconItemData:
                data = XmlUtils.getBytes(childNode);
                break;
        }
    }
    if (uuid && data) {
        this.customIcons[uuid] = data;
    }
};

KdbxMeta.prototype._writeCustomIcons = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomIcons);
    var customIcons = this.customIcons;
    Object.keys(customIcons).forEach(function(uuid) {
        var data = customIcons[uuid];
        if (data) {
            var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconItem);
            XmlUtils.setUuid(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemID), uuid);
            XmlUtils.setBytes(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemData), data);
        }
    });
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
    var binary = XmlUtils.getProtectedBinary(node);
    if (id) {
        this.binaries[id] = binary;
    }
};

KdbxMeta.prototype._writeBinaries = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binaries);
    var binaries = this.binaries;
    Object.keys(binaries).forEach(function(id) {
        var data = binaries[id];
        if (data) {
            var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.Binary);
            itemNode.setAttribute(XmlNames.Attr.Id, id);
            XmlUtils.setProtectedBinary(itemNode, data);
        }
    });
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

KdbxMeta.prototype._writeCustomData = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomData);
    var customData = this.customData;
    Object.keys(customData).forEach(function(key) {
        var value = customData[key];
        if (value) {
            var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.StringDictExItem);
            XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Key), key);
            XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Value), value);
        }
    });
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 */
KdbxMeta.prototype.write = function(parentNode) {
    this.generator = Constants.generator;
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Meta);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Generator), Constants.Generator);
    XmlUtils.setBytes(XmlUtils.addChildNode(node, XmlNames.Elem.HeaderHash), this.headerHash);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbName), this.name);
    XmlUtils.setDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbNameChanged), this.nameChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDesc), this.desc);
    XmlUtils.setDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDescChanged), this.descChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUser), this.defaultUser);
    XmlUtils.setDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUserChanged), this.defaultUserChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbMntncHistoryDays), this.mntncHistoryDays);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbColor), this.color);
    XmlUtils.setDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChanged), this.keyChanged);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeRec), this.keyChangeRec);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeForce), this.keyChangeForce);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinEnabled), this.recycleBinEnabled);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinUuid), this.recycleBinUuid);
    XmlUtils.setDate(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinChanged), this.recycleBinChanged);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroup), this.entryTemplatesGroup);
    XmlUtils.setDate(XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroupChanged), this.entryTemplatesGroupChanged);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxItems), this.historyMaxItems);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxSize), this.historyMaxSize);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastSelectedGroup), this.lastSelectedGroup);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleGroup), this.lastTopVisibleGroup);
    this._writeMemoryProtection(node);
    this._writeCustomIcons(node);
    this._writeBinaries(node);
    this._writeCustomData(node);
};

/**
 * Merge meta with another db
 * @param {KdbxMeta} remote
 * @param {{objects, remote, deleted}} objectMap
 */
KdbxMeta.prototype.merge = function(remote, objectMap) {
    if (remote.nameChanged > this.nameChanged) {
        this.name = remote.name;
        this.nameChanged = remote.nameChanged;
    }
    if (remote.descChanged > this.descChanged) {
        this.desc = remote.desc;
        this.descChanged = remote.descChanged;
    }
    if (remote.defaultUserChanged > this.defaultUserChanged) {
        this.defaultUser = remote.defaultUser;
        this.defaultUserChanged = remote.defaultUserChanged;
    }
    if (remote.keyChanged > this.keyChanged) {
        this.keyChanged = remote.keyChanged;
        this.keyChangeRec = remote.keyChangeRec;
        this.keyChangeForce = remote.keyChangeForce;
    }
    if (remote.recycleBinChanged > this.recycleBinChanged) {
        this.recycleBinEnabled = remote.recycleBinEnabled;
        this.recycleBinUuid = remote.recycleBinUuid;
        this.recycleBinChanged = remote.recycleBinChanged;
    }
    if (remote.entryTemplatesGroupChanged > this.entryTemplatesGroupChanged) {
        this.entryTemplatesGroup = remote.entryTemplatesGroup;
        this.entryTemplatesGroupChanged = remote.entryTemplatesGroupChanged;
    }
    Object.keys(remote.customData).forEach(function(key) {
        if (!this.customData[key] && !objectMap.deleted[key]) {
            this.customData[key] = remote.customData[key];
        }
    }, this);
    Object.keys(remote.customIcons).forEach(function(key) {
        if (!this.customIcons[key] && !objectMap.deleted[key]) {
            this.customIcons[key] = remote.customIcons[key];
        }
    }, this);
    Object.keys(remote.binaries).forEach(function(key) {
        if (!this.binaries[key] && !objectMap.deleted[key]) {
            this.binaries[key] = remote.binaries[key];
        }
    }, this);
};

/**
 * Creates new meta
 * @returns {KdbxMeta}
 */
KdbxMeta.create = function() {
    var now = new Date();
    var meta = new KdbxMeta();
    meta.generator = Constants.Generator;
    meta.mntncHistoryDays = Consts.Defaults.MntncHistoryDays;
    meta.recycleBinEnabled = true;
    meta.historyMaxItems = Consts.Defaults.HistoryMaxItems;
    meta.historyMaxSize = Consts.Defaults.HistoryMaxSize;
    meta.nameChanged = now;
    meta.descChanged = now;
    meta.defaultUserChanged = now;
    meta.recycleBinChanged = now;
    meta.keyChangeRec = -1;
    meta.keyChangeForce = -1;
    meta.entryTemplatesGroup = new KdbxUuid();
    meta.entryTemplatesGroupChanged = now;
    meta.memoryProtection = { title: false, userName: false, password: true, url: false, notes: false };
    return meta;
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
