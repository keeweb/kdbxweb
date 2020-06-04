'use strict';

var ProtectedValue = require('../crypto/protected-value'),
    XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils'),
    Consts = require('../defs/consts'),
    KdbxCustomData = require('./kdbx-custom-data'),
    KdbxUuid = require('./kdbx-uuid'),
    KdbxTimes = require('./kdbx-times');

var tagsSplitRegex = /\s*[;,:]\s*/;

/**
 * Entry
 * @constructor
 */
var KdbxEntry = function () {
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
        enabled: true,
        obfuscation: Consts.AutoTypeObfuscationOptions.None,
        defaultSequence: undefined,
        items: []
    };
    this.history = [];
    this.parentGroup = undefined;
    this.customData = undefined;
    this._editState = undefined;
    Object.preventExtensions(this);
};

KdbxEntry.prototype._readNode = function (node, ctx) {
    switch (node.tagName) {
        case XmlNames.Elem.Uuid:
            this.uuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Icon:
            this.icon = XmlUtils.getNumber(node) || Consts.Icons.Key;
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
            this._readBinary(node, ctx);
            break;
        case XmlNames.Elem.AutoType:
            this._readAutoType(node);
            break;
        case XmlNames.Elem.History:
            this._readHistory(node, ctx);
            break;
        case XmlNames.Elem.CustomData:
            this._readCustomData(node);
            break;
    }
};

KdbxEntry.prototype._readField = function (node) {
    var keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key),
        valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value),
        key = XmlUtils.getText(keyNode),
        value = XmlUtils.getProtectedText(valueNode);
    if (key) {
        this.fields[key] = value;
    }
};

KdbxEntry.prototype._writeFields = function (parentNode) {
    var fields = this.fields;
    Object.keys(fields).forEach(function (field) {
        var value = fields[field];
        if (value !== undefined && value !== null) {
            var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.String);
            XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), field);
            XmlUtils.setProtectedText(XmlUtils.addChildNode(node, XmlNames.Elem.Value), value);
        }
    });
};

KdbxEntry.prototype._readBinary = function (node, ctx) {
    var keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key),
        valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value),
        key = XmlUtils.getText(keyNode),
        value = XmlUtils.getProtectedBinary(valueNode);
    if (key && value) {
        if (value.ref) {
            value.ref = ctx.kdbx.binaries.idToHash[value.ref];
            if (value.ref) {
                value.value = ctx.kdbx.binaries[value.ref];
            } else {
                value = null;
            }
        }
        if (value) {
            this.binaries[key] = value;
        }
    }
};

KdbxEntry.prototype._writeBinaries = function (parentNode, ctx) {
    var binaries = this.binaries;
    Object.keys(binaries).forEach(function (id) {
        var data = binaries[id];
        if (data) {
            if (data.ref) {
                var index = ctx.kdbx.binaries.hashOrder.indexOf(data.ref);
                if (index < 0) {
                    return;
                }
                data = { ref: index.toString() };
            }
            var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binary);
            XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), id);
            XmlUtils.setProtectedBinary(XmlUtils.addChildNode(node, XmlNames.Elem.Value), data);
        }
    });
};

KdbxEntry.prototype._stringToTags = function (str) {
    if (!str) {
        return [];
    }
    return str.split(tagsSplitRegex).filter(function (s) {
        return s;
    });
};

KdbxEntry.prototype._readAutoType = function (node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.AutoTypeEnabled:
                this.autoType.enabled = XmlUtils.getBoolean(childNode);
                if (typeof this.autoType.enabled !== 'boolean') {
                    this.autoType.enabled = true;
                }
                break;
            case XmlNames.Elem.AutoTypeObfuscation:
                this.autoType.obfuscation =
                    XmlUtils.getNumber(childNode) || Consts.AutoTypeObfuscationOptions.None;
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

KdbxEntry.prototype._readAutoTypeItem = function (node) {
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

KdbxEntry.prototype._writeAutoType = function (parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.AutoType);
    XmlUtils.setBoolean(
        XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeEnabled),
        this.autoType.enabled
    );
    XmlUtils.setNumber(
        XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeObfuscation),
        this.autoType.obfuscation || Consts.AutoTypeObfuscationOptions.None
    );
    if (this.autoType.defaultSequence) {
        XmlUtils.setText(
            XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeDefaultSeq),
            this.autoType.defaultSequence
        );
    }
    for (var i = 0; i < this.autoType.items.length; i++) {
        var item = this.autoType.items[i];
        var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeItem);
        XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Window), item.window);
        XmlUtils.setText(
            XmlUtils.addChildNode(itemNode, XmlNames.Elem.KeystrokeSequence),
            item.keystrokeSequence
        );
    }
};

KdbxEntry.prototype._readHistory = function (node, ctx) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Entry:
                this.history.push(KdbxEntry.read(childNode, ctx));
                break;
        }
    }
};

KdbxEntry.prototype._writeHistory = function (parentNode, ctx) {
    var historyNode = XmlUtils.addChildNode(parentNode, XmlNames.Elem.History);
    for (var i = 0; i < this.history.length; i++) {
        this.history[i].write(historyNode, ctx);
    }
};

KdbxEntry.prototype._readCustomData = function (node) {
    this.customData = KdbxCustomData.read(node);
};

KdbxEntry.prototype._writeCustomData = function (parentNode) {
    KdbxCustomData.write(parentNode, this.customData);
};

KdbxEntry.prototype._setField = function (name, str, secure) {
    this.fields[name] = secure ? ProtectedValue.fromString(str) : str;
};

KdbxEntry.prototype._addHistoryTombstone = function (isAdded, dt) {
    if (!this._editState) {
        this._editState = { added: [], deleted: [] };
    }
    this._editState[isAdded ? 'added' : 'deleted'].push(dt.getTime());
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxEntry.prototype.write = function (parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Entry);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
    XmlUtils.setNumber(
        XmlUtils.addChildNode(node, XmlNames.Elem.Icon),
        this.icon || Consts.Icons.Key
    );
    if (this.customIcon) {
        XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
    }
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.FgColor), this.fgColor);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.BgColor), this.bgColor);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.OverrideUrl), this.overrideUrl);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Tags), this.tags.join(','));
    this.times.write(node, ctx);
    this._writeFields(node);
    this._writeBinaries(node, ctx);
    this._writeAutoType(node);
    this._writeCustomData(node);
    if (parentNode.tagName !== XmlNames.Elem.History) {
        this._writeHistory(node, ctx);
    }
};

/**
 * Push current entry state to the top of history
 */
KdbxEntry.prototype.pushHistory = function () {
    var historyEntry = new KdbxEntry();
    historyEntry.copyFrom(this);
    this.history.push(historyEntry);
    this._addHistoryTombstone(true, historyEntry.times.lastModTime);
};

/**
 * Remove some entry history states at index
 * @param {number} index - history state start index
 * @param {number} [count=1] - deleted states count
 */
KdbxEntry.prototype.removeHistory = function (index, count) {
    if (count === undefined) {
        count = 1;
    }
    for (var ix = index; ix < index + count; ix++) {
        if (ix < this.history.length) {
            this._addHistoryTombstone(false, this.history[ix].times.lastModTime);
        }
    }
    this.history.splice(index, count);
};

/**
 * Clone entry state from another entry, or history entry
 */
KdbxEntry.prototype.copyFrom = function (entry) {
    this.uuid = entry.uuid;
    this.icon = entry.icon;
    this.customIcon = entry.customIcon;
    this.fgColor = entry.fgColor;
    this.bgColor = entry.bgColor;
    this.overrideUrl = entry.overrideUrl;
    this.tags = entry.tags.slice();
    this.times = entry.times.clone();
    this.fields = {};
    Object.keys(entry.fields).forEach(function (name) {
        if (entry.fields[name] instanceof ProtectedValue) {
            this.fields[name] = entry.fields[name].clone();
        } else {
            this.fields[name] = entry.fields[name];
        }
    }, this);
    this.binaries = {};
    Object.keys(entry.binaries).forEach(function (name) {
        if (entry.binaries[name] instanceof ProtectedValue) {
            this.binaries[name] = entry.binaries[name].clone();
        } else if (entry.binaries[name] && entry.binaries[name].ref) {
            this.binaries[name] = { ref: entry.binaries[name].ref };
            if (entry.binaries[name].value) {
                this.binaries[name].value = entry.binaries[name].value;
            }
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
KdbxEntry.prototype.merge = function (objectMap) {
    var remoteEntry = objectMap.remote[this.uuid];
    if (!remoteEntry) {
        return;
    }
    var remoteHistory = remoteEntry.history.slice();
    if (this.times.lastModTime < remoteEntry.times.lastModTime) {
        // remote is more new; push current state to history and update
        this.pushHistory();
        this.copyFrom(remoteEntry);
    } else if (this.times.lastModTime > remoteEntry.times.lastModTime) {
        // local is more new; if remote state is not in history, push it
        var existsInHistory = this.history.some(function (historyEntry) {
            return +historyEntry.times.lastModTime === +remoteEntry.times.lastModTime;
        });
        if (!existsInHistory) {
            var historyEntry = new KdbxEntry();
            historyEntry.copyFrom(remoteEntry);
            remoteHistory.push(historyEntry);
        }
    }
    this.history = this._mergeHistory(remoteHistory, remoteEntry.times.lastModTime);
};

/**
 * Merge entry history with remote entry history
 * Tombstones are stored locally and must be immediately discarded by replica after successful upstream push.
 * It's client responsibility, to save and load tombstones for local replica, and to clear them after successful upstream push.
 *
 * Implements remove-win OR-set CRDT with local tombstones stored in _editState.
 *
 * Format doesn't allow saving tombstones for history entries, so they are stored locally.
 * Any unmodified state from past or modifications of current state synced with central upstream will be successfully merged.
 * Assumes there's only one central upstream, may produce inconsistencies while merging outdated replica outside main upstream.
 * Phantom entries and phantom deletions will appear if remote replica checked out an old state and has just added a new state.
 * If a client is using central upstream for sync, the remote replica must first sync it state and
 * only after it update the upstream, so this should never happen.
 *
 * References:
 *
 * An Optimized Conflict-free Replicated Set arXiv:1210.3368 [cs.DC]
 * http://arxiv.org/abs/1210.3368
 *
 * Gene T. J. Wuu and Arthur J. Bernstein. Efficient solutions to the replicated log and dictionary
 * problems. In Symp. on Principles of Dist. Comp. (PODC), pages 233–242, Vancouver, BC, Canada, August 1984.
 * https://pages.lip6.fr/Marc.Shapiro/papers/RR-7687.pdf
 *
 * @param {KdbxEntry[]} remoteHistory - history records from remote entry
 * @param {Date} remoteLastModTime - last mod time for remote entry
 * @returns {KdbxEntry[]} - new history
 * @private
 */
KdbxEntry.prototype._mergeHistory = function (remoteHistory, remoteLastModTime) {
    // we can skip sorting but the history may not have been sorted
    this.history.sort(function (x, y) {
        return x.times.lastModTime - y.times.lastModTime;
    });
    remoteHistory.sort(function (x, y) {
        return x.times.lastModTime - y.times.lastModTime;
    });
    var historyMap = {},
        remoteHistoryMap = {};
    this.history.forEach(function (record) {
        historyMap[record.times.lastModTime.getTime()] = record;
    });
    remoteHistory.forEach(function (record) {
        remoteHistoryMap[record.times.lastModTime.getTime()] = record;
    });
    var historyIx = 0,
        remoteHistoryIx = 0;
    var newHistory = [];
    while (historyIx < this.history.length || remoteHistoryIx < remoteHistory.length) {
        var historyEntry = this.history[historyIx],
            remoteHistoryEntry = remoteHistory[remoteHistoryIx],
            entryTime = historyEntry && historyEntry.times.lastModTime.getTime(),
            remoteEntryTime = remoteHistoryEntry && remoteHistoryEntry.times.lastModTime.getTime();
        if (entryTime === remoteEntryTime) {
            // exists in local and remote
            newHistory.push(historyEntry);
            historyIx++;
            remoteHistoryIx++;
            continue;
        }
        if (!historyEntry || entryTime > remoteEntryTime) {
            // local is absent
            if (!this._editState || this._editState.deleted.indexOf(remoteEntryTime) < 0) {
                // added remotely
                var remoteHistoryEntryClone = new KdbxEntry();
                remoteHistoryEntryClone.copyFrom(remoteHistoryEntry);
                newHistory.push(remoteHistoryEntryClone);
            } // else: deleted locally
            remoteHistoryIx++;
            continue;
        }
        // (!remoteHistoryEntry || entryTime < remoteEntryTime) && historyEntry
        // remote is absent
        if (this._editState && this._editState.added.indexOf(entryTime) >= 0) {
            // added locally
            newHistory.push(historyEntry);
        } else if (entryTime > remoteLastModTime) {
            // outdated replica history has ended
            newHistory.push(historyEntry);
        } // else: deleted remotely
        historyIx++;
    }
    return newHistory;
};

/**
 * Creates new entry
 * @param {KdbxMeta} meta - db metadata
 * @param {KdbxGroup} parentGroup - parent group
 * @returns {KdbxEntry}
 */
KdbxEntry.create = function (meta, parentGroup) {
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
    entry.autoType.enabled =
        typeof parentGroup.enableAutoType === 'boolean' ? parentGroup.enableAutoType : true;
    entry.autoType.obfuscation = Consts.AutoTypeObfuscationOptions.None;
    return entry;
};

/**
 * Read entry from xml
 * @param {Node} xmlNode
 * @param {KdbxContext} ctx
 * @param {KdbxGroup} [parentGroup]
 * @return {KdbxEntry}
 */
KdbxEntry.read = function (xmlNode, ctx, parentGroup) {
    var entry = new KdbxEntry();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            entry._readNode(childNode, ctx);
        }
    }
    if (!entry.uuid) {
        // some clients don't write ids
        entry.uuid = KdbxUuid.random();
        for (var j = 0; j < entry.history.length; j++) {
            entry.history[j].uuid = entry.uuid;
        }
    }
    entry.parentGroup = parentGroup;
    return entry;
};

module.exports = KdbxEntry;
