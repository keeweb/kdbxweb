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
    if (this.customIcon) {
        XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
    }
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
 * Invokes callback for each entry in recursive way
 * @param {function} callback - will be invoked with entry or group argument
 * @param {function} [thisArg] - callback context
 */
KdbxGroup.prototype.forEach = function(callback, thisArg) {
    callback.call(thisArg, undefined, this);
    this.entries.forEach(function(entry) { callback.call(thisArg, entry); });
    this.groups.forEach(function(group) { group.forEach(callback); });
};

/**
 * Merge group with remote group
 * @param {{objects, remote, deleted}} objectMap
 */
KdbxGroup.prototype.merge = function(objectMap) {
    var remoteGroup = objectMap.remote[this.uuid];
    if (!remoteGroup) {
        return;
    }
    if (remoteGroup.times.lastModTime > this.times.lastModTime) {
        this.copyFrom(remoteGroup);
    }
    this.groups = this._mergeCollection(this.groups, remoteGroup.groups, objectMap);
    this.entries = this._mergeCollection(this.entries, remoteGroup.entries, objectMap);
    this.groups.forEach(function(group) { group.merge(objectMap); });
    this.entries.forEach(function(entry) { entry.merge(objectMap); });
};

/**
 * Merge object collection with remote collection
 * Implements 2P-set CRDT with tombstones stored in objectMap.deleted
 * Assumes tombstones are already merged
 * @param {object[]} collection - local groups or entries
 * @param {object[]} remoteCollection - remote groups or entries
 * @param {{objects, remote, deleted}} objectMap - local objects hashmap, remote objects hashmap and tombstones
 * @returns {object[]}
 * @private
 */
KdbxGroup.prototype._mergeCollection = function(collection, remoteCollection, objectMap) {
    var remoteItems = {};
    remoteCollection.forEach(function(remoteItem) {
        remoteItems[remoteItem.uuid] = remoteItem;
    });
    var items = {};
    collection.forEach(function(item) {
        items[item.uuid] = item;
    });
    var newItems = [];
    collection.forEach(function(item) {
        if (objectMap.deleted[item.uuid]) {
            return; // item deleted
        }
        var remoteItem = remoteItems[item.uuid];
        if (remoteItem) {
            newItems.push(item); // item not changed
        } else {
            remoteItem = objectMap.remote[item.uuid];
            if (!remoteItem) {
                newItems.push(item); // item added locally
            } else if (remoteItem.times.locationChanged <= item.times.locationChanged) {
                newItems.push(item); // item moved to this group locally later than remote
            }
        }
    }, this);
    remoteCollection.forEach(function(remoteItem) {
        var item = items[remoteItem.uuid];
        if (item || objectMap.deleted[remoteItem.uuid]) {
            return; // item already processed as local item or deleted
        }
        item = objectMap.objects[remoteItem.uuid];
        if (item && remoteItem.times.locationChanged > item.times.locationChanged) {
            item.parentGroup = this; // item moved to this group remotely later than local
            newItems.push(item);
        } else if (!item) {
            // item created remotely
            var newItem = new remoteItem.constructor();
            newItem.copyFrom(remoteItem);
            newItem.parentGroup = this;
            newItems.push(newItem);
        }
    }, this);
    return newItems;
};

/**
 * Clone group state from another group
 */
KdbxGroup.prototype.copyFrom = function(group) {
    this.uuid = group.uuid;
    this.name = group.name;
    this.notes = group.notes;
    this.icon = group.icon;
    this.customIcon = group.customIcon;
    this.times = group.times.clone();
    this.expanded = group.expanded;
    this.defaultAutoTypeSeq = group.defaultAutoTypeSeq;
    this.enableAutoType = group.enableAutoType;
    this.enableSearching = group.enableSearching;
    this.lastTopVisibleEntry = group.lastTopVisibleEntry;
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
    group.expanded = true;
    group.enableAutoType = null;
    group.enableSearching = null;
    group.lastTopVisibleEntry = new KdbxUuid();
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
