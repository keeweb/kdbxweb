'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils'),
    KdbxTimes = require('./kdbx-times'),
    KdbxEntry = require('./kdbx-entry');

/**
 * Entries group
 * @constructor
 */
var KdbxGroup = function() {
    this.uuid = undefined;
    this.name = undefined;
    this.notes = undefined;
    this.icon = undefined;
    this.customIcon = undefined;
    this.times = new KdbxTimes();
    this.expanded = undefined;
    this.defaultAutoTypeSeq = undefined;
    this.enableAutoType = undefined;
    this.enableSearching = undefined;
    this.lastTopVisibleEntry = undefined;
    this.groups = [];
    this.entries = [];
    Object.preventExtensions(this);
};

KdbxGroup.prototype._readNode = function(node) {
    switch (node.tagName) {
        case XmlNames.Elem.Uuid:
            this.uuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Name:
            this.name = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.Notes:
            this.notes = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.Icon:
            this.icon = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.CustomIconID:
            this.customIcon = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Times:
            this.times = KdbxTimes.read(node);
            break;
        case XmlNames.Elem.IsExpanded:
            this.expanded = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.GroupDefaultAutoTypeSeq:
            this.defaultAutoTypeSeq = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.EnableAutoType:
            this.enableAutoType = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.EnableSearching:
            this.enableSearching = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.LastTopVisibleEntry:
            this.lastTopVisibleEntry = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Group:
            this.groups.push(KdbxGroup.read(node));
            break;
        case XmlNames.Elem.Entry:
            this.entries.push(KdbxEntry.read(node));
            break;
    }
};

/**
 * Read group from xml
 * @param {Node} xmlNode
 * @return {KdbxGroup}
 */
KdbxGroup.read = function(xmlNode) {
    var grp = new KdbxGroup();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            grp._readNode(childNode);
        }
    }
    return grp;
};

module.exports = KdbxGroup;
