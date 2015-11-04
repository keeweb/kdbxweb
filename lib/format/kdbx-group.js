'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils'),
    Consts = require('../defs/consts'),
    KdbxTimes = require('./kdbx-times'),
    KdbxUuid = require('./kdbx-uuid'),
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
    this.parentGroup = undefined;
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
            this.groups.push(KdbxGroup.read(node, this));
            break;
        case XmlNames.Elem.Entry:
            this.entries.push(KdbxEntry.read(node, this));
            break;
    }
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 */
KdbxGroup.prototype.write = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Group);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Name), this.name);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Notes), this.notes);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.Icon), this.icon);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
    this.times.write(node);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.IsExpanded), this.expanded);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.GroupDefaultAutoTypeSeq), this.defaultAutoTypeSeq);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.EnableAutoType), this.enableAutoType);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.EnableSearching), this.enableSearching);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleEntry), this.lastTopVisibleEntry);
    this.groups.forEach(function(g) { g.write(node); });
    this.entries.forEach(function(e) { e.write(node); });
};

/**
 * Creates new group
 * @param {string} name
 * @param {KdbxGroup} [parentGroup]
 * @returns {KdbxGroup}
 */
KdbxGroup.create = function(name, parentGroup) {
    var group = new KdbxGroup();
    group.uuid = KdbxUuid.random();
    group.icon = Consts.Icons.Folder;
    group.times = KdbxTimes.create();
    group.name = name;
    group.parentGroup = parentGroup;
    return group;
};

/**
 * Read group from xml
 * @param {Node} xmlNode
 * @param {KdbxGroup} [parentGroup]
 * @return {KdbxGroup}
 */
KdbxGroup.read = function(xmlNode, parentGroup) {
    var grp = new KdbxGroup();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            grp._readNode(childNode);
        }
    }
    grp.parentGroup = parentGroup;
    return grp;
};

module.exports = KdbxGroup;
