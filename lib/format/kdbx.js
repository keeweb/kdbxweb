'use strict';

var
    KdbxFormat = require('./kdbx-format'),
    KdbxError = require('./../errors/kdbx-error'),
    KdbxCredentials = require('./kdbx-credentials'),
    KdbxHeader = require('./kdbx-header'),
    KdbxMeta = require('./kdbx-meta'),
    KdbxBinaries = require('./kdbx-binaries'),
    KdbxGroup = require('./kdbx-group'),
    KdbxEntry = require('./kdbx-entry'),
    KdbxDeletedObject = require('./kdbx-deleted-object'),
    KdbxUuid = require('./kdbx-uuid'),
    Consts = require('./../defs/consts'),
    XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils');

/**
 * Kdbx file (KeePass database v2)
 * @constructor
 */
var Kdbx = function() {
    this.header = undefined;
    this.credentials = undefined;
    this.meta = undefined;
    this.xml = undefined;
    this.binaries = new KdbxBinaries();
    this.groups = [];
    this.deletedObjects = [];
    Object.preventExtensions(this);
};

/**
 * Creates new database
 * @return {Kdbx}
 */
Kdbx.create = function(credentials, name) {
    if (!(credentials instanceof KdbxCredentials)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials');
    }
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    kdbx.header = KdbxHeader.create();
    kdbx.meta = KdbxMeta.create();
    kdbx.meta._name = name;
    kdbx.createDefaultGroup();
    kdbx.createRecycleBin();
    kdbx.meta._lastSelectedGroup = kdbx.getDefaultGroup().id;
    kdbx.meta._lastTopVisibleGroup = kdbx.getDefaultGroup().id;
    return kdbx;
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @param {KdbxCredentials} credentials
 * @return {Promise.<Kdbx>}
 */
Kdbx.load = function(data, credentials) {
    if (!(data instanceof ArrayBuffer)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'data'));
    }
    if (!(credentials instanceof KdbxCredentials)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials'));
    }
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    var format = new KdbxFormat(kdbx);
    return format.load(data);
};

/**
 * Import database from xml file
 * If there was an error loading xml file, throws an exception
 * @param {String} data - xml file contents
 * @param {KdbxCredentials} credentials
 * @return {Promise.<Kdbx>}
 */
Kdbx.loadXml = function(data, credentials) {
    if ((typeof data !== 'string')) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'data'));
    }
    if (!(credentials instanceof KdbxCredentials)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials'));
    }
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    var format = new KdbxFormat(kdbx);
    return format.loadXml(data);
};

/**
 * Save db to ArrayBuffer
 * @return {Promise.<ArrayBuffer>}
 */
Kdbx.prototype.save = function() {
    var format = new KdbxFormat(this);
    return format.save();
};

/**
 * Save db to XML
 * @return {Promise.<String>}
 */
Kdbx.prototype.saveXml = function() {
    var format = new KdbxFormat(this);
    return format.saveXml();
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
 * @return {KdbxGroup}
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
 * Move object from one group to another
 * @param {KdbxEntry|KdbxGroup} object - object to be moved
 * @param {KdbxGroup} toGroup - target parent group
 * @param {Number} [atIndex] - index in target group (by default, insert to the end of the group)
 */
Kdbx.prototype.move = function(object, toGroup, atIndex) {
    var containerProp = object instanceof KdbxGroup ? 'groups' : 'entries';
    var fromContainer = object.parentGroup[containerProp];
    var ix = fromContainer.indexOf(object);
    if (ix < 0) {
        return;
    }
    fromContainer.splice(ix, 1);
    if (toGroup) {
        if (typeof atIndex === 'number' && atIndex >= 0) {
            toGroup[containerProp].splice(atIndex, 0, object);
        } else {
            toGroup[containerProp].push(object);
        }
    } else {
        var now = new Date();
        if (object instanceof KdbxGroup) {
            object.forEach(function (group, entry) {
                this.addDeletedObject((group || entry).uuid, now);
            }, this);
        } else {
            this.addDeletedObject(object.uuid, now);
        }
    }
    object.parentGroup = toGroup;
    object.times.locationChanged = new Date();
};

/**
 * Adds deleted object
 * @param {KdbxUuid} uuid - object uuid
 * @param {Date} dt - deletion date
 */
Kdbx.prototype.addDeletedObject = function(uuid, dt) {
    var deletedObject = new KdbxDeletedObject();
    deletedObject.uuid = uuid;
    deletedObject.deletionTime = dt;
    this.deletedObjects.push(deletedObject);
};

/**
 * Delete entry or group
 * Depending on settings, removes either to trash, or completely
 * @param {KdbxEntry|KdbxGroup} object - object to be deleted
 */
Kdbx.prototype.remove = function(object) {
    var toGroup = null;
    if (this.meta.recycleBinEnabled) {
        this.createRecycleBin();
        toGroup = this.getGroup(this.meta.recycleBinUuid);
    }
    this.move(object, toGroup);
};

/**
 * Creates a binary in the db and returns a reference to it
 * @param {ProtectedValue|ArrayBuffer} value
 * @return {Promise}
 */
Kdbx.prototype.createBinary = function(value) {
    return this.binaries.add(value);
};

/**
 * Perform database cleanup
 * @param {object} settings - cleanup settings
 * @param {boolean} [settings.historyRules=false] - remove extra history, it it doesn't match defined rules, e.g. records number
 * @param {boolean} [settings.customIcons=false] - remove unused custom icons
 * @param {boolean} [settings.binaries=false] - remove unused binaries
 */
Kdbx.prototype.cleanup = function(settings) {
    var now = new Date();
    var historyMaxItems = settings && settings.historyRules && this.meta.historyMaxItems && this.meta.historyMaxItems > 0 ?
        this.meta.historyMaxItems : Infinity;
    var usedCustomIcons = {};
    var usedBinaries = {};
    var processEntry = function(entry) {
        if (entry && entry.customIcon) {
            usedCustomIcons[entry.customIcon] = true;
        }
        if (entry && entry.binaries) {
            Object.keys(entry.binaries).forEach(function(key) {
                if (entry.binaries[key] && entry.binaries[key].ref) {
                    usedBinaries[entry.binaries[key].ref] = true;
                }
            });
        }
    };
    this.getDefaultGroup().forEach(function (entry, group) {
        if (entry && entry.history.length > historyMaxItems) {
            entry.removeHistory(0, entry.history.length - historyMaxItems);
        }
        if (entry) {
            processEntry(entry);
        }
        if (entry && entry.history) {
            entry.history.forEach(function(historyEntry) {
                processEntry(historyEntry);
            });
        }
        if (group && group.customIcon) {
            usedCustomIcons[group.customIcon] = true;
        }
    });
    if (settings && settings.customIcons) {
        Object.keys(this.meta.customIcons).forEach(function(customIcon) {
            if (!usedCustomIcons[customIcon]) {
                var uuid = new KdbxUuid(customIcon);
                this.addDeletedObject(uuid, now);
                delete this.meta.customIcons[customIcon];
            }
        }, this);
    }
    if (settings && settings.binaries) {
        Object.keys(this.binaries).forEach(function(bin) {
            if (!usedBinaries[bin]) {
                delete this.binaries[bin];
            }
        }, this);
    }
};

/**
 * Merge db with another db
 * Some parts of remote DB are copied by reference, so it should NOT be modified after merge
 * Suggested use case:
 * - open local db
 * - get remote db somehow and open in
 * - merge remote into local: local.merge(remote)
 * - close remote db
 * @param {Kdbx} remote - database to merge in
 */
Kdbx.prototype.merge = function(remote) {
    var root = this.getDefaultGroup();
    var remoteRoot = remote.getDefaultGroup();
    if (!root || !remoteRoot) {
        throw new KdbxError(Consts.ErrorCodes.MergeError, 'no default group');
    }
    if (!root.uuid.equals(remoteRoot.uuid)) {
        throw new KdbxError(Consts.ErrorCodes.MergeError, 'default group is different');
    }
    var objectMap = this._getObjectMap();
    remote.deletedObjects.forEach(function(rem) {
        if (!objectMap.deleted[rem.uuid]) {
            this.deletedObjects.push(rem);
            objectMap.deleted[rem.uuid] = rem.deletionTime;
        }
    }, this);
    Object.keys(remote.binaries).forEach(function(key) {
        if (!this.binaries[key] && !objectMap.deleted[key]) {
            this.binaries[key] = remote.binaries[key];
        }
    }, this);
    objectMap.remote = remote._getObjectMap().objects;
    this.meta.merge(remote.meta, objectMap);
    root.merge(objectMap);
    this.cleanup({ historyRules: true, customIcons: true, binaries: true });
};

/**
 * Gets editing state tombstones (for successful merge)
 * Replica must save this state with the db, assign in on db open and call removeLocalEditState on successful upstream push
 * This state is JSON serializable
 */
Kdbx.prototype.getLocalEditState = function() {
    var editingState = {};
    this.getDefaultGroup().forEach(function(entry) {
        if (entry && entry._editState) {
            editingState[entry.uuid] = entry._editState;
        }
    });
    if (this.meta._editState) {
        editingState.meta = this.meta._editState;
    }
    return editingState;
};

/**
 * Sets editing state tombstones returned previously by getLocalEditState
 * Replica must call this method on db open with state returned previously on getLocalEditState
 * @param editingState - result of getLocalEditState invoked before db save
 */
Kdbx.prototype.setLocalEditState = function(editingState) {
    this.getDefaultGroup().forEach(function(entry) {
        if (entry && editingState[entry.uuid]) {
            entry._editState = editingState[entry.uuid];
        }
    });
    if (editingState.meta) {
        this.meta._editState = editingState.meta;
    }
};

/**
 * Removes editing state tombstones
 * Immediately after successful upstream push replica must:
 * - call this method
 * - discard previous state obtained by getLocalEditState call
 */
Kdbx.prototype.removeLocalEditState = function() {
    this.getDefaultGroup().forEach(function(entry) {
        if (entry) {
            entry._editState = undefined;
        }
    });
    this.meta._editState = undefined;
};

/**
 * Upgrade the file to latest version
 */
Kdbx.prototype.upgrade = function() {
    this.meta.headerHash = null;
    this.meta.settingsChanged = new Date();
    this.header.upgrade();
};

Kdbx.prototype._getObjectMap = function() {
    var objects = {}, deleted = {};
    this.getDefaultGroup().forEach(function(entry, group) {
        var object = entry || group;
        if (objects[object.uuid]) {
            throw new KdbxError(Consts.ErrorCodes.MergeError, 'Duplicate: ' + object.uuid);
        }
        objects[object.uuid] = object;
    });
    this.deletedObjects.forEach(function(deletedObject) {
        deleted[deletedObject.uuid] = deletedObject.deletionTime;
    });
    return { objects: objects, deleted: deleted };
};

Kdbx.prototype._loadFromXml = function(ctx) {
    var doc = this.xml.documentElement;
    if (doc.tagName !== XmlNames.Elem.DocNode) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad xml root');
    }
    this._parseMeta(ctx);
    var that = this;
    return this.binaries.hash().then(function() {
        that._parseRoot(ctx);
        return that;
    });
};

Kdbx.prototype._parseMeta = function(ctx) {
    var node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Meta, 'no meta node');
    this.meta = KdbxMeta.read(node, ctx);
};

Kdbx.prototype._parseRoot = function(ctx) {
    this.groups = [];
    this.deletedObjects = [];
    var node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Root, 'no root node');
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Group:
                this._readGroup(childNode, ctx);
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

Kdbx.prototype._readGroup = function(node, ctx) {
    this.groups.push(KdbxGroup.read(node, ctx));
};

Kdbx.prototype._buildXml = function(ctx) {
    var xml = XmlUtils.create(XmlNames.Elem.DocNode);
    this.meta.write(xml.documentElement, ctx);
    var rootNode = XmlUtils.addChildNode(xml.documentElement, XmlNames.Elem.Root);
    this.groups.forEach(function(g) { g.write(rootNode, ctx); }, this);
    var delObjNode = XmlUtils.addChildNode(rootNode, XmlNames.Elem.DeletedObjects);
    this.deletedObjects.forEach(function (d) { d.write(delObjNode, ctx); }, this);
    this.xml = xml;
};

module.exports = Kdbx;
