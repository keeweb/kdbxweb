'use strict';

var KdbxError = require('../errors/kdbx-error');
var Consts = require('../defs/consts');
var ByteUtils = require('../utils/byte-utils');
var Int64 = require('../utils/int64');

var MaxSupportedVersion = 1;
var DefaultVersion = 0x0100;

/**
 * Value type
 * @enum
 */
var ValueType = {
    UInt32: 0x04,
    UInt64: 0x05,
    Bool: 0x08,
    Int32: 0x0c,
    Int64: 0x0d,
    String: 0x18,
    Bytes: 0x42
};

/**
 * Variant dictionary, capable to store/load different values from byte array
 * @constructor
 */
function VarDictionary() {
    this._items = [];
    this._dict = {};
    Object.preventExtensions(this);
}

/**
 * Available value types enum
 * @enum
 */
VarDictionary.ValueType = ValueType;

/**
 * Gets value or undefined
 * @param {string} key
 * @returns {*}
 */
VarDictionary.prototype.get = function (key) {
    var item = this._dict[key];
    return item ? item.value : undefined;
};

/**
 * Get all keys
 * @return {string[]} keys array
 */
VarDictionary.prototype.keys = function () {
    return this._items.map(function (item) {
        return item.key;
    });
};

/**
 * Keys count
 * @returns {Number}
 */
Object.defineProperty(VarDictionary.prototype, 'length', {
    enumberable: true,
    get: function () {
        return this._items.length;
    }
});

/**
 * Sets or replaces existing item
 * @param {String} key
 * @param {VarDictionary.ValueType|Number} type
 * @param {*} value
 */
VarDictionary.prototype.set = function (key, type, value) {
    switch (type) {
        case ValueType.UInt32:
            if (typeof value !== 'number' || value < 0) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.UInt64:
            if (!(value instanceof Int64)) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Bool:
            if (typeof value !== 'boolean') {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Int32:
            if (typeof value !== 'number') {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Int64:
            if (!(value instanceof Int64)) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.String:
            if (typeof value !== 'string') {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Bytes:
            if (value instanceof Uint8Array) {
                value = ByteUtils.arrayToBuffer(value);
            }
            if (!(value instanceof ArrayBuffer)) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.InvalidArg);
    }
    var item = { key: key, type: type, value: value };
    if (this._dict[key]) {
        var ix = this._items.indexOf(this._dict[key]);
        this._items.splice(ix, 1, item);
    } else {
        this._items.push(item);
    }
    this._dict[key] = item;
};

/**
 * Removes key from dictionary
 * @param {string} key
 */
VarDictionary.prototype.remove = function (key) {
    this._items = this._items.filter(function (item) {
        return item.key !== key;
    });
    delete this._dict[key];
};

/**
 * Reads dictionary from stream
 * @param {BinaryStream} stm
 * @returns {VarDictionary}
 * @static
 */
VarDictionary.read = function (stm) {
    var dict = new VarDictionary();
    dict._readVersion(stm);
    while (true) {
        var item = dict._readItem(stm);
        if (!item) {
            break;
        }
        dict._items.push(item);
        dict._dict[item.key] = item;
    }
    return dict;
};

VarDictionary.prototype._readVersion = function (stm) {
    stm.getUint8();
    var versionMajor = stm.getUint8();
    if (versionMajor === 0 || versionMajor > MaxSupportedVersion) {
        throw new KdbxError(Consts.ErrorCodes.InvalidVersion);
    }
};

VarDictionary.prototype._readItem = function (stm) {
    var type = stm.getUint8();
    if (!type) {
        return false;
    }
    var keyLength = stm.getInt32(true);
    if (keyLength <= 0) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad key length');
    }
    var key = ByteUtils.bytesToString(stm.readBytes(keyLength));
    var valueLength = stm.getInt32(true);
    if (valueLength < 0) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad value length');
    }
    var value;
    switch (type) {
        case ValueType.UInt32:
            if (valueLength !== 4) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad uint32');
            }
            value = stm.getUint32(true);
            break;
        case ValueType.UInt64:
            if (valueLength !== 8) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad uint64');
            }
            var loInt = stm.getUint32(true);
            var hiInt = stm.getUint32(true);
            value = new Int64(loInt, hiInt);
            break;
        case ValueType.Bool:
            if (valueLength !== 1) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad bool');
            }
            value = stm.getUint8() !== 0;
            break;
        case ValueType.Int32:
            if (valueLength !== 4) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad int32');
            }
            value = stm.getInt32(true);
            break;
        case ValueType.Int64:
            if (valueLength !== 8) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad int64');
            }
            var loUint = stm.getUint32(true);
            var hiUint = stm.getUint32(true);
            value = new Int64(loUint, hiUint);
            break;
        case ValueType.String:
            value = ByteUtils.bytesToString(stm.readBytes(valueLength));
            break;
        case ValueType.Bytes:
            value = stm.readBytes(valueLength);
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad value type: ' + type);
    }
    return { key: key, type: type, value: value };
};

/**
 * Writes self to binary stream
 * @param {BinaryStream} stm
 */
VarDictionary.prototype.write = function (stm) {
    this._writeVersion(stm);
    Object.keys(this._items).forEach(function (key) {
        this._writeItem(stm, this._items[key]);
    }, this);
    stm.setUint8(0);
};

VarDictionary.prototype._writeVersion = function (stm) {
    stm.setUint16(DefaultVersion, true);
};

VarDictionary.prototype._writeItem = function (stm, item) {
    stm.setUint8(item.type);
    var keyBytes = ByteUtils.stringToBytes(item.key);
    stm.setInt32(keyBytes.length, true);
    stm.writeBytes(keyBytes);
    switch (item.type) {
        case ValueType.UInt32:
            stm.setInt32(4, true);
            stm.setUint32(item.value, true);
            break;
        case ValueType.UInt64:
            stm.setInt32(8, true);
            stm.setUint32(item.value.lo, true);
            stm.setUint32(item.value.hi, true);
            break;
        case ValueType.Bool:
            stm.setInt32(1, true);
            stm.setUint8(item.value ? 1 : 0);
            break;
        case ValueType.Int32:
            stm.setInt32(4, true);
            stm.setInt32(item.value, true);
            break;
        case ValueType.Int64:
            stm.setInt32(8, true);
            stm.setUint32(item.value.lo, true);
            stm.setUint32(item.value.hi, true);
            break;
        case ValueType.String:
            var strBytes = ByteUtils.stringToBytes(item.value);
            stm.setInt32(strBytes.length, true);
            stm.writeBytes(strBytes);
            break;
        case ValueType.Bytes:
            var bytesBuffer = ByteUtils.arrayToBuffer(item.value);
            stm.setInt32(bytesBuffer.byteLength, true);
            stm.writeBytes(bytesBuffer);
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.Unsupported);
    }
};

module.exports = VarDictionary;
