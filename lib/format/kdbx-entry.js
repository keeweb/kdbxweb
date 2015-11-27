'use strict';

var ProtectedValue = require('../crypto/protected-value'),
    XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils'),
    Consts = require('../defs/consts'),
    KdbxUuid = require('./kdbx-uuid'),
    KdbxTimes = require('./kdbx-times');

var tagsSplitRegex = /\s*[;,:]\s*/;

/**
 * Entry
 * @constructor
 */
var KdbxEntry = function() {
    this.uuid = undefined;
    this.icon = undefined;
    this.customIcon = undefined;
    this.fgColor = undefined;
    this.bgColor = undefined;
    this.overrideUrl = undefined;
    this.tags = [];
    this.times = new KdbxTimes();
    this.fields = {};
    this.binaries = {};
    this.autoType = {
        enabled: undefined, obfuscation: undefined, defaultSequence: undefined, items: []
    };
    this.history = [];
    this.parentGroup = undefined;
    Object.preventExtensions(this);
};

KdbxEntry.prototype._readNode = function(node) {
    switch (node.tagName) {
        case XmlNames.Elem.Uuid:
            this.uuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Icon:
            this.icon = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.CustomIconID:
            this.customIcon = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.FgColor:
            this.fgColor = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.BgColor:
            this.bgColor = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.OverrideUrl:
            this.overrideUrl = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.Tags:
            this.tags = this._stringToTags(XmlUtils.getText(node));
            break;
        case XmlNames.Elem.Times:
            this.times = KdbxTimes.read(node);
            break;
        case XmlNames.Elem.String:
            this._readField(node);
            break;
        case XmlNames.Elem.Binary:
            this._readBinary(node);
            break;
        case XmlNames.Elem.AutoType:
            this._readAutoType(node);
            break;
        case XmlNames.Elem.History:
            this._readHistory(node);
            break;
    }
};

KdbxEntry.prototype._readField = function(node) {
    var keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key),
        valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value),
        key = XmlUtils.getText(keyNode),
        value = XmlUtils.getProtectedText(valueNode);
    if (key && value) {
        this.fields[key] = value;
    }
};

KdbxEntry.prototype._writeFields = function(parentNode) {
    var fields = this.fields;
    Object.keys(fields).forEach(function(field) {
        var value = fields[field];
        if (value !== undefined && value !== null) {
            var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.String);
            XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), field);
            XmlUtils.setProtectedText(XmlUtils.addChildNode(node, XmlNames.Elem.Value), value);
        }
    });
};

KdbxEntry.prototype._readBinary = function(node) {
    var keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key),
        valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value),
        key = XmlUtils.getText(keyNode),
        value = XmlUtils.getProtectedBinary(valueNode);
    if (key && value) {
        this.binaries[key] = value;
    }
};

KdbxEntry.prototype._writeBinaries = function(parentNode) {
    var binaries = this.binaries;
    Object.keys(binaries).forEach(function(id) {
        var data = binaries[id];
        if (data) {
            var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binary);
            XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), id);
            XmlUtils.setProtectedBinary(XmlUtils.addChildNode(node, XmlNames.Elem.Value), data);
        }
    });
};

KdbxEntry.prototype._stringToTags = function(str) {
    if (!str) {
        return [];
    }
    return str.split(tagsSplitRegex).filter(function(s) { return s; });
};

KdbxEntry.prototype._readAutoType = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.AutoTypeEnabled:
                this.autoType.enabled = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.AutoTypeObfuscation:
                this.autoType.obfuscation = XmlUtils.getNumber(childNode);
                break;
            case XmlNames.Elem.AutoTypeDefaultSeq:
                this.autoType.defaultSequence = XmlUtils.getText(childNode);
                break;
            case XmlNames.Elem.AutoTypeItem:
                this._readAutoTypeItem(childNode);
                break;
        }
    }
};

KdbxEntry.prototype._readAutoTypeItem = function(node) {
    var item = {};
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Window:
                item.window = XmlUtils.getText(childNode);
                break;
            case XmlNames.Elem.KeystrokeSequence:
                item.keystrokeSequence = XmlUtils.getText(childNode);
                break;
        }
    }
    this.autoType.items.push(item);
};

KdbxEntry.prototype._writeAutoType = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.AutoType);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeEnabled), this.autoType.enabled);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeObfuscation), this.autoType.obfuscation);
    if (this.autoType.defaultSequence) {
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeDefaultSeq), this.autoType.defaultSequence);
    }
    for (var i = 0; i < this.autoType.items.length; i++) {
        var item = this.autoType.items[i];
        var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeItem);
        XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Window), item.window);
        XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.KeystrokeSequence), item.keystrokeSequence);
    }
};

KdbxEntry.prototype._readHistory = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Entry:
                this.history.push(KdbxEntry.read(childNode));
                break;
        }
    }
};

KdbxEntry.prototype._writeHistory = function(parentNode) {
    var historyNode = XmlUtils.addChildNode(parentNode, XmlNames.Elem.History);
    for (var i = 0; i < this.history.length; i++) {
        this.history[i].write(historyNode);
    }
};

KdbxEntry.prototype._setField = function(name, str, secure) {
    this.fields[name] = secure ? ProtectedValue.fromString(str) : str;
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 */
KdbxEntry.prototype.write = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Entry);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.Icon), this.icon);
    if (this.customIcon) {
        XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
    }
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.FgColor), this.fgColor);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.BgColor), this.bgColor);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.OverrideUrl), this.overrideUrl);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Tags), this.tags.join(','));
    this.times.write(node);
    this._writeFields(node);
    this._writeBinaries(node);
    this._writeAutoType(node);
    if (parentNode.tagName !== XmlNames.Elem.History) {
        this._writeHistory(node);
    }
};

/**
 * Push current entry state to the top of history
 */
KdbxEntry.prototype.pushHistory = function() {
    var historyEntry = new KdbxEntry();
    historyEntry.copyFrom(this);
    this.history.push(historyEntry);
};

/**
 * Clone entry state from another entry, or history entry
 */
KdbxEntry.prototype.copyFrom = function(entry) {
    this.uuid = entry.uuid;
    this.icon = entry.icon;
    this.customIcon = entry.customIcon;
    this.fgColor = entry.fgColor;
    this.bgColor = entry.bgColor;
    this.overrideUrl = entry.overrideUrl;
    this.tags = entry.tags.slice();
    this.times = entry.times.clone();
    Object.keys(entry.fields).forEach(function(name) {
        if (entry.fields[name] instanceof ProtectedValue) {
            this.fields[name] = entry.fields[name].clone();
        } else {
            this.fields[name] = entry.fields[name];
        }
    }, this);
    Object.keys(entry.binaries).forEach(function(name) {
        if (entry.binaries[name] instanceof ProtectedValue) {
            this.binaries[name] = entry.binaries[name].clone();
        } else if (entry.binaries[name] && entry.binaries[name].ref) {
            this.binaries[name] = { ref: entry.binaries[name].ref };
        } else {
            this.binaries[name] = entry.binaries[name];
        }
    }, this);
    this.autoType = JSON.parse(JSON.stringify(entry.autoType));
};

/**
 * Merge entry with remote entry
 * @param {{objects, remote, deleted}} objectMap
 */
KdbxEntry.prototype.merge = function(objectMap) {
    var remoteEntry = objectMap.remote[this.uuid];
    if (!remoteEntry) {
        return;
    }
    // TODO: merge entries
};

/**
 * Creates new entry
 * @param {KdbxMeta} meta - db metadata
 * @param {KdbxGroup} parentGroup - parent group
 * @returns {KdbxEntry}
 */
KdbxEntry.create = function(meta, parentGroup) {
    var entry = new KdbxEntry(parentGroup);
    entry.uuid = KdbxUuid.random();
    entry.icon = Consts.Icons.Key;
    entry.times = KdbxTimes.create();
    entry.parentGroup = parentGroup;
    entry._setField('Title', '', meta.memoryProtection.title);
    entry._setField('UserName', meta.defaultUser || '', meta.memoryProtection.userName);
    entry._setField('Password', '', meta.memoryProtection.password);
    entry._setField('URL', '', meta.memoryProtection.url);
    entry._setField('Notes', '', meta.memoryProtection.notes);
    entry.autoType.enabled = typeof parentGroup.enableAutoType === 'boolean' ? parentGroup.enableAutoType : true;
    entry.autoType.obfuscation = Consts.AutoTypeObfuscationOptions.None;
    return entry;
};

/**
 * Read entry from xml
 * @param {Node} xmlNode
 * @param {KdbxGroup} [parentGroup]
 * @return {KdbxEntry}
 */
KdbxEntry.read = function(xmlNode, parentGroup) {
    var entry = new KdbxEntry();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            entry._readNode(childNode);
        }
    }
    entry.parentGroup = parentGroup;
    return entry;
};

module.exports = KdbxEntry;
