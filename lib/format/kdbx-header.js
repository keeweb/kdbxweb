'use strict';

var KdbxUuid = require('./kdbx-uuid'),
    Consts = require('./../defs/consts'),
    KdbxError = require('./../errors/kdbx-error'),
    BinaryStream = require('./../utils/binary-stream');

var HeaderNames = [
    'EndOfHeader', 'Comment', 'CipherID', 'CompressionFlags', 'MasterSeed', 'TransformSeed',
    'TransformRounds', 'EncryptionIV', 'ProtectedStreamKey', 'StreamStartBytes', 'InnerRandomStreamID'
];

var HeaderConst = {
    FileSignature1: 0x9AA2D903,
    FileSignature2: 0xB54BFB67,
    FileVersion: 0x00030001,
    FileVersionCriticalMask: 0xFFFF0000
};

/**
 * Binary file header reader/writer
 * @constructor
 */
var KdbxHeader = function() {
    this.version = undefined;
    this.dataCipherUuid = undefined;
    this.compression = undefined;
    this.masterSeed = undefined;
    this.transformSeed = undefined;
    this.keyEncryptionRounds = undefined;
    this.encryptionIV = undefined;
    this.protectedStreamKey = undefined;
    this.streamStartBytes = undefined;
    this.crsAlgorithm = undefined;
    this.endPos = undefined;
    Object.preventExtensions(this);
};

KdbxHeader.prototype._readSignature = function(stm) {
    var sig1 = stm.getUint32(true), sig2 = stm.getUint32(true);
    if (!(sig1 === HeaderConst.FileSignature1 && sig2 === HeaderConst.FileSignature2)) {
        throw new KdbxError(Consts.ErrorCodes.BadSignature);
    }
};

KdbxHeader.prototype._writeSignature = function(stm) {
    stm.setUint32(HeaderConst.FileSignature1, true);
    stm.setUint32(HeaderConst.FileSignature2, true);
};

KdbxHeader.prototype._readVersion = function(stm) {
    var version = stm.getUint32(true);
    if ((version & HeaderConst.FileVersionCriticalMask) >
        (HeaderConst.FileVersion & HeaderConst.FileVersionCriticalMask)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidVersion);
    }
    this.version = version;
};

KdbxHeader.prototype._writeVersion = function(stm) {
    stm.setUint32(HeaderConst.FileVersion, true);
};

KdbxHeader.prototype._readCipherID = function(bytes) {
    if (bytes.byteLength !== 16) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'cipher');
    }
    this.dataCipherUuid = new KdbxUuid(bytes);
};

KdbxHeader.prototype._writeCipherID = function(stm) {
    this._writeFieldSize(stm, 16);
    stm.setBytes(this.dataCipherUuid.bytes);
};

KdbxHeader.prototype._readCompressionFlags = function(bytes) {
    var id = new DataView(bytes).getUint32(bytes, true);
    if (id < 0 || id >= Object.keys(Consts.CompressionAlgorithm).length) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'compression');
    }
    this.compression = id;
};

KdbxHeader.prototype._writeCompressionFlags = function(stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(this.compression, true);
};

KdbxHeader.prototype._readMasterSeed = function(bytes) {
    this.masterSeed = bytes;
};

KdbxHeader.prototype._writeMasterSeed = function(stm) {
    this._writeFieldBytes(stm, this.masterSeed);
};

KdbxHeader.prototype._readTransformSeed = function(bytes) {
    this.transformSeed = bytes;
};

KdbxHeader.prototype._writeTransformSeed = function(stm) {
    this._writeFieldBytes(stm, this.transformSeed);
};

KdbxHeader.prototype._readTransformRounds = function(bytes) {
    this.keyEncryptionRounds = new BinaryStream(bytes).getUint64(true);
};

KdbxHeader.prototype._writeTransformRounds = function(stm) {
    this._writeFieldSize(stm, 8);
    stm.setUint64(this.transformRounds, true);
};

KdbxHeader.prototype._readEncryptionIV = function(bytes) {
    this.encryptionIV = bytes;
};

KdbxHeader.prototype._writeEncryptionIV = function(stm) {
    this._writeFieldBytes(stm, this.encryptionIV);
};

KdbxHeader.prototype._readProtectedStreamKey = function(bytes) {
    this.protectedStreamKey = bytes;
};

KdbxHeader.prototype._writeProtectedStreamKey = function(stm) {
    this._writeFieldBytes(stm, this.protectedStreamKey);
};

KdbxHeader.prototype._readStreamStartBytes = function(bytes) {
    this.streamStartBytes = bytes;
};

KdbxHeader.prototype._writeStreamStartBytes = function(stm) {
    this._writeFieldBytes(stm, this.streamStartBytes);
};

KdbxHeader.prototype._readInnerRandomStreamID = function(bytes) {
    var id = new DataView(bytes).getUint32(bytes, true);
    if (id !== Consts.CrsAlgorithm.Salsa20) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'algorithm');
    }
    this.crsAlgorithm = id;
};

KdbxHeader.prototype._writeInnerRandomStreamID = function(stm) {
    this._writeFieldSize(4);
    stm.setUint32(this.crsAlgorithm, true);
};

KdbxHeader.prototype._readField = function(stm) {
    var headerId = stm.getUint8(),
        size = stm.getUint16(true),
        bytes;
    if (size > 0) {
        bytes = stm.readBytes(size);
    }
    var headerName = HeaderNames[headerId];
    if (headerName) {
        var method = this['_read' + headerName];
        if (method) {
            method.call(this, bytes);
        }
    }
    return headerId !== 0;
};

KdbxHeader.prototype._writeField = function(stm, headerId) {
    var headerName = HeaderNames[headerId];
    if (headerName) {
        var method = this['_write' + headerName];
        if (method) {
            stm.setUint8(headerId);
            method.call(this, stm);
        }
    }
};

KdbxHeader.prototype._writeFieldSize = function(stm, size) {
    stm.setUint16(size, true);
};

KdbxHeader.prototype._writeFieldBytes = function(stm, bytes) {
    this._writeFieldSize(stm, bytes.byteLength);
    stm.setBytes(bytes);
};

KdbxHeader.prototype._validate = function() {
    if (this.dataCipherUuid === undefined) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no cipher in header');
    }
    if (this.compression === undefined) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no compression in header');
    }
    if (!this.masterSeed) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no master seed in header');
    }
    if (!this.transformSeed) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no transform seed in header');
    }
    if (!this.keyEncryptionRounds) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no key encryption rounds in header');
    }
    if (!this.encryptionIV) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no encryption iv in header');
    }
    if (!this.protectedStreamKey) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no protected stream key in header');
    }
    if (!this.streamStartBytes) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no stream start bytes in header');
    }
    if (this.crsAlgorithm === undefined) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no crs algorithm in header');
    }
};

/**
 * Saved header to stream
 * @param {BinaryStream} stm
 */
KdbxHeader.prototype.write = function(stm) {
    this._writeSignature(stm);
    this._writeVersion(stm);
    for (var i = 0; i < HeaderNames.length; i++) {
        this._writeField(stm, i);
    }
};

/**
 * Read header from stream
 * @param {BinaryStream} stm
 * @return {KdbxHeader}
 */
KdbxHeader.read = function(stm) {
    var header = new KdbxHeader();
    header._readSignature(stm);
    header._readVersion(stm);
    while (header._readField(stm)) {
        continue;
    }
    header.endPos = stm.pos;
    header._validate();
    return header;
};

module.exports = KdbxHeader;
