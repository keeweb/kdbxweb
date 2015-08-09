'use strict';

/**
 * Stream for accessing array buffer with auto-advanced position
 * @param {ArrayBuffer} arrayBuffer
 * @constructor
 */
function BinaryStream(arrayBuffer) {
    this._arrayBuffer = arrayBuffer;
    this._dataView = new DataView(arrayBuffer);
    this._pos = 0;
}

['Int', 'Uint', 'Float'].forEach(function(type) {
    (type === 'Float' ? [4, 8] : [1, 2, 4]).forEach(function(bytes) {
        var getMethod = 'get' + type + bytes * 8;
        BinaryStream.prototype[getMethod] = function(littleEndian) {
            var res = this._dataView[getMethod].call(this._dataView, this._pos, littleEndian);
            this._pos += bytes;
            return res;
        };
        var setMethod = 'set' + type + bytes * 8;
        BinaryStream.prototype[setMethod] = function(value, littleEndian) {
            this._dataView[setMethod].call(this._dataView, this._pos, value, littleEndian);
            this._pos += bytes;
        };
    });
});

BinaryStream.prototype.getUint64 = function(littleEndian) {
    var part1 = this.getUint32(littleEndian),
        part2 = this.getUint32(littleEndian);
    if (littleEndian) {
        part2 *= 0x100000000;
    } else {
        part1 *= 0x100000000;
    }
    return part1 + part2;
};

BinaryStream.prototype.setUint64 = function(value, littleEndian) {
    if (littleEndian) {
        this.setUint32(value & 0xffffffff, true);
        this.setUint32(Math.floor(value / 0x100000000), true);
    } else {
        this.setUint32(Math.floor(value / 0x100000000), false);
        this.setUint32(value & 0xffffffff, false);
    }
};

BinaryStream.prototype.readBytes = function(size) {
    var buffer = this._arrayBuffer.slice(this._pos, this._pos + size);
    this._pos += size;
    return buffer;
};

BinaryStream.prototype.readBytesToEnd = function() {
    var size = this._arrayBuffer.byteLength - this._pos;
    return this.readBytes(size);
};

BinaryStream.prototype.readBytesNoAdvance = function(startPos, endPos) {
    return this._arrayBuffer.slice(startPos, endPos);
};

Object.defineProperty(BinaryStream.prototype, 'pos', {
    enumerable: true,
    get: function() {
        return this._pos;
    }
});

module.exports = BinaryStream;
