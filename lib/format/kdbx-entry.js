'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils'),
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

KdbxEntry.prototype._readBinary = function(node) {
    var keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key),
        valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value),
        key = XmlUtils.getText(keyNode),
        value = XmlUtils.getProtectedBinary(valueNode);
    if (key && value) {
        this.binaries[key] = value;
    }
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

/**
 * Read entry from xml
 * @param {Node} xmlNode
 * @return {KdbxEntry}
 */
KdbxEntry.read = function(xmlNode) {
    var entry = new KdbxEntry();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            entry._readNode(childNode);
        }
    }
    return entry;
};

module.exports = KdbxEntry;
