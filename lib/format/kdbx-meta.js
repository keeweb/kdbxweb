'use strict';

var XmlNames = require('./../defs/xml-names'),
    KdbxUuid = require('./kdbx-uuid'),
    KdbxCustomData = require('./kdbx-custom-data'),
    XmlUtils = require('./../utils/xml-utils'),
    Consts = require('./../defs/consts');

var Constants = {
    Generator: 'KdbxWeb'
};

/**
 * Db metadata
 * @constructor
 */
var KdbxMeta = function () {
    this.generator = undefined;
    this.headerHash = undefined;
    this.settingsChanged = undefined;
    this._name = undefined;
    this.nameChanged = undefined;
    this._desc = undefined;
    this.descChanged = undefined;
    this._defaultUser = undefined;
    this.defaultUserChanged = undefined;
    this._mntncHistoryDays = undefined;
    this._color = undefined;
    this.keyChanged = undefined;
    this._keyChangeRec = undefined;
    this._keyChangeForce = undefined;
    this._recycleBinEnabled = undefined;
    this._recycleBinUuid = undefined;
    this.recycleBinChanged = undefined;
    this._entryTemplatesGroup = undefined;
    this.entryTemplatesGroupChanged = undefined;
    this._historyMaxItems = undefined;
    this._historyMaxSize = undefined;
    this._lastSelectedGroup = undefined;
    this._lastTopVisibleGroup = undefined;
    this._memoryProtection = {
        title: undefined,
        userName: undefined,
        password: undefined,
        url: undefined,
        notes: undefined
    };
    this.customData = {};
    this.customIcons = {};
    this._editState = undefined;
    Object.preventExtensions(this);
};

var props = {
    name: 'nameChanged',
    desc: 'descChanged',
    defaultUser: 'defaultUserChanged',
    mntncHistoryDays: null,
    color: null,
    keyChangeRec: null,
    keyChangeForce: null,
    recycleBinEnabled: 'recycleBinChanged',
    recycleBinUuid: 'recycleBinChanged',
    entryTemplatesGroup: 'entryTemplatesGroupChanged',
    historyMaxItems: null,
    historyMaxSize: null,
    lastSelectedGroup: null,
    lastTopVisibleGroup: null,
    memoryProtection: null
};

Object.keys(props).forEach(function (prop) {
    createProperty(prop, props[prop]);
});

function createProperty(prop, propChanged) {
    var field = '_' + prop;
    Object.defineProperty(KdbxMeta.prototype, prop, {
        enumerable: true,
        get: function () {
            return this[field];
        },
        set: function (value) {
            if (value !== this[field]) {
                this[field] = value;
                if (propChanged) {
                    this[propChanged] = new Date();
                } else {
                    this._setPropModDate(prop);
                }
            }
        }
    });
}

KdbxMeta.prototype._setPropModDate = function (prop) {
    if (!this._editState) {
        this._editState = {};
    }
    this._editState[prop] = new Date().getTime();
};

KdbxMeta.prototype._readNode = function (node, ctx) {
    switch (node.tagName) {
        case XmlNames.Elem.Generator:
            this.generator = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.HeaderHash:
            this.headerHash = XmlUtils.getBytes(node);
            break;
        case XmlNames.Elem.SettingsChanged:
            this.settingsChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbName:
            this._name = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbNameChanged:
            this.nameChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbDesc:
            this._desc = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbDescChanged:
            this.descChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbDefaultUser:
            this._defaultUser = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbDefaultUserChanged:
            this.defaultUserChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbMntncHistoryDays:
            this._mntncHistoryDays = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.DbColor:
            this._color = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbKeyChanged:
            this.keyChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbKeyChangeRec:
            this._keyChangeRec = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.DbKeyChangeForce:
            this._keyChangeForce = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.RecycleBinEnabled:
            this._recycleBinEnabled = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.RecycleBinUuid:
            this._recycleBinUuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.RecycleBinChanged:
            this.recycleBinChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.EntryTemplatesGroup:
            this._entryTemplatesGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.EntryTemplatesGroupChanged:
            this.entryTemplatesGroupChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.HistoryMaxItems:
            this._historyMaxItems = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.HistoryMaxSize:
            this._historyMaxSize = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.LastSelectedGroup:
            this._lastSelectedGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.LastTopVisibleGroup:
            this._lastTopVisibleGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.MemoryProt:
            this._readMemoryProtection(node);
            break;
        case XmlNames.Elem.CustomIcons:
            this._readCustomIcons(node);
            break;
        case XmlNames.Elem.Binaries:
            this._readBinaries(node, ctx);
            break;
        case XmlNames.Elem.CustomData:
            this._readCustomData(node);
            break;
    }
};

KdbxMeta.prototype._readMemoryProtection = function (node) {
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

KdbxMeta.prototype._writeMemoryProtection = function (parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.MemoryProt);
    XmlUtils.setBoolean(
        XmlUtils.addChildNode(node, XmlNames.Elem.ProtTitle),
        this.memoryProtection.title
    );
    XmlUtils.setBoolean(
        XmlUtils.addChildNode(node, XmlNames.Elem.ProtUserName),
        this.memoryProtection.userName
    );
    XmlUtils.setBoolean(
        XmlUtils.addChildNode(node, XmlNames.Elem.ProtPassword),
        this.memoryProtection.password
    );
    XmlUtils.setBoolean(
        XmlUtils.addChildNode(node, XmlNames.Elem.ProtUrl),
        this.memoryProtection.url
    );
    XmlUtils.setBoolean(
        XmlUtils.addChildNode(node, XmlNames.Elem.ProtNotes),
        this.memoryProtection.notes
    );
};

KdbxMeta.prototype._readCustomIcons = function (node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName === XmlNames.Elem.CustomIconItem) {
            this._readCustomIcon(childNode);
        }
    }
};

KdbxMeta.prototype._readCustomIcon = function (node) {
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

KdbxMeta.prototype._writeCustomIcons = function (parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomIcons);
    var customIcons = this.customIcons;
    Object.keys(customIcons).forEach(function (uuid) {
        var data = customIcons[uuid];
        if (data) {
            var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconItem);
            XmlUtils.setUuid(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemID), uuid);
            XmlUtils.setBytes(
                XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemData),
                data
            );
        }
    });
};

KdbxMeta.prototype._readBinaries = function (node, ctx) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName === XmlNames.Elem.Binary) {
            this._readBinary(childNode, ctx);
        }
    }
};

KdbxMeta.prototype._readBinary = function (node, ctx) {
    var id = node.getAttribute(XmlNames.Attr.Id);
    var binary = XmlUtils.getProtectedBinary(node);
    if (id && binary) {
        ctx.kdbx.binaries[id] = binary;
    }
};

KdbxMeta.prototype._writeBinaries = function (parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binaries);
    var binaries = ctx.kdbx.binaries;
    binaries.hashOrder.forEach(function (hash, index) {
        var data = binaries[hash];
        if (data) {
            var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.Binary);
            itemNode.setAttribute(XmlNames.Attr.Id, index.toString());
            XmlUtils.setProtectedBinary(itemNode, data);
        }
    });
};

KdbxMeta.prototype._readCustomData = function (node) {
    this.customData = KdbxCustomData.read(node);
};

KdbxMeta.prototype._writeCustomData = function (parentNode) {
    KdbxCustomData.write(parentNode, this.customData);
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxMeta.prototype.write = function (parentNode, ctx) {
    this.generator = Constants.generator;
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Meta);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Generator), Constants.Generator);
    if (ctx.kdbx.header.versionMajor < 4) {
        XmlUtils.setBytes(XmlUtils.addChildNode(node, XmlNames.Elem.HeaderHash), this.headerHash);
    } else if (this.settingsChanged) {
        ctx.setXmlDate(
            XmlUtils.addChildNode(node, XmlNames.Elem.SettingsChanged),
            this.settingsChanged
        );
    }
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbName), this.name);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbNameChanged), this.nameChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDesc), this.desc);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDescChanged), this.descChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUser), this.defaultUser);
    ctx.setXmlDate(
        XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUserChanged),
        this.defaultUserChanged
    );
    XmlUtils.setText(
        XmlUtils.addChildNode(node, XmlNames.Elem.DbMntncHistoryDays),
        this.mntncHistoryDays
    );
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbColor), this.color);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChanged), this.keyChanged);
    XmlUtils.setNumber(
        XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeRec),
        this.keyChangeRec
    );
    XmlUtils.setNumber(
        XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeForce),
        this.keyChangeForce
    );
    XmlUtils.setBoolean(
        XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinEnabled),
        this.recycleBinEnabled
    );
    XmlUtils.setUuid(
        XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinUuid),
        this.recycleBinUuid
    );
    ctx.setXmlDate(
        XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinChanged),
        this.recycleBinChanged
    );
    XmlUtils.setUuid(
        XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroup),
        this.entryTemplatesGroup
    );
    ctx.setXmlDate(
        XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroupChanged),
        this.entryTemplatesGroupChanged
    );
    XmlUtils.setNumber(
        XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxItems),
        this.historyMaxItems
    );
    XmlUtils.setNumber(
        XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxSize),
        this.historyMaxSize
    );
    XmlUtils.setUuid(
        XmlUtils.addChildNode(node, XmlNames.Elem.LastSelectedGroup),
        this.lastSelectedGroup
    );
    XmlUtils.setUuid(
        XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleGroup),
        this.lastTopVisibleGroup
    );
    this._writeMemoryProtection(node);
    this._writeCustomIcons(node);
    if (ctx.exportXml || ctx.kdbx.header.versionMajor < 4) {
        this._writeBinaries(node, ctx);
    }
    this._writeCustomData(node);
};

/**
 * Merge meta with another db
 * @param {KdbxMeta} remote
 * @param {{objects, remote, deleted}} objectMap
 */
KdbxMeta.prototype.merge = function (remote, objectMap) {
    if (remote.nameChanged > this.nameChanged) {
        this._name = remote.name;
        this.nameChanged = remote.nameChanged;
    }
    if (remote.descChanged > this.descChanged) {
        this._desc = remote.desc;
        this.descChanged = remote.descChanged;
    }
    if (remote.defaultUserChanged > this.defaultUserChanged) {
        this._defaultUser = remote.defaultUser;
        this.defaultUserChanged = remote.defaultUserChanged;
    }
    if (remote.keyChanged > this.keyChanged) {
        this.keyChanged = remote.keyChanged;
    }
    if (remote.settingsChanged > this.settingsChanged) {
        this.settingsChanged = remote.settingsChanged;
    }
    if (remote.recycleBinChanged > this.recycleBinChanged) {
        this._recycleBinEnabled = remote.recycleBinEnabled;
        this._recycleBinUuid = remote.recycleBinUuid;
        this.recycleBinChanged = remote.recycleBinChanged;
    }
    if (remote.entryTemplatesGroupChanged > this.entryTemplatesGroupChanged) {
        this._entryTemplatesGroup = remote.entryTemplatesGroup;
        this.entryTemplatesGroupChanged = remote.entryTemplatesGroupChanged;
    }
    Object.keys(remote.customData).forEach(function (key) {
        if (!this.customData[key] && !objectMap.deleted[key]) {
            this.customData[key] = remote.customData[key];
        }
    }, this);
    Object.keys(remote.customIcons).forEach(function (key) {
        if (!this.customIcons[key] && !objectMap.deleted[key]) {
            this.customIcons[key] = remote.customIcons[key];
        }
    }, this);
    if (!this._editState || !this._editState.historyMaxItems) {
        this.historyMaxItems = remote.historyMaxItems;
    }
    if (!this._editState || !this._editState.historyMaxSize) {
        this.historyMaxSize = remote.historyMaxSize;
    }
    if (!this._editState || !this._editState.keyChangeRec) {
        this.keyChangeRec = remote.keyChangeRec;
    }
    if (!this._editState || !this._editState.keyChangeForce) {
        this.keyChangeForce = remote.keyChangeForce;
    }
    if (!this._editState || !this._editState.mntncHistoryDays) {
        this.mntncHistoryDays = remote.mntncHistoryDays;
    }
    if (!this._editState || !this._editState.color) {
        this.color = remote.color;
    }
};

/**
 * Creates new meta
 * @returns {KdbxMeta}
 */
KdbxMeta.create = function () {
    var now = new Date();
    var meta = new KdbxMeta();
    meta.generator = Constants.Generator;
    meta.settingsChanged = now;
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
    meta.memoryProtection = {
        title: false,
        userName: false,
        password: true,
        url: false,
        notes: false
    };
    return meta;
};

/**
 * Read KdbxMeta from stream
 * @param {Node} xmlNode - xml Meta node
 * @param {KdbxContext} ctx
 * @return {KdbxMeta}
 */
KdbxMeta.read = function (xmlNode, ctx) {
    var meta = new KdbxMeta();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            meta._readNode(childNode, ctx);
        }
    }
    return meta;
};

module.exports = KdbxMeta;
