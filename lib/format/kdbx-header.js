'use strict';

var Uuid = require('./uuid'),
    Consts = require('./../defs/consts'),
    KdbxError = require('./../errors/kdbx-error'),
    BinaryStream = require('./../utils/binary-stream');

var HeaderNames = [
    'EndOfHeader', 'Comment', 'CipherID', 'CompressionFlags', 'MasterSeed', 'TransformSeed',
    'TransformRounds', 'EncryptionIV', 'ProtectedStreamKey', 'StreamStartBytes', 'InnerRandomStreamID'
];

/**
 * Binary file header reader/writer
 * @constructor
 */
var KdbxHeader = function() {
    this.dataCipherUuid = undefined;
    this.compression = undefined;
    this.masterSeed = undefined;
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

KdbxHeader.prototype._readCipherID = function(bytes) {
    if (bytes.byteLength !== 16) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'cipher');
    }
    this.dataCipherUuid = new Uuid(bytes);
};

KdbxHeader.prototype._readCompressionFlags = function(bytes) {
    var id = new DataView(bytes).getUint32(bytes, true);
    if (id < 0 || id >= Object.keys(Consts.CompressionAlgorithm).length) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'compression');
    }
    this.compression = id;
};

KdbxHeader.prototype._readMasterSeed = function(bytes) {
    this.masterSeed = bytes;
};

KdbxHeader.prototype._readTransformSeed = function(bytes) {
    this.transformSeed = bytes;
};

KdbxHeader.prototype._readTransformRounds = function(bytes) {
    this.keyEncryptionRounds = new BinaryStream(bytes).getUint64(true);
};

KdbxHeader.prototype._readEncryptionIV = function(bytes) {
    this.encryptionIV = bytes;
};

KdbxHeader.prototype._readProtectedStreamKey = function(bytes) {
    this.protectedStreamKey = bytes;
};

KdbxHeader.prototype._readStreamStartBytes = function(bytes) {
    this.streamStartBytes = bytes;
};

KdbxHeader.prototype._readInnerRandomStreamID = function(bytes) {
    var id = new DataView(bytes).getUint32(bytes, true);
    if (id !== Consts.CrsAlgorithm.Salsa20) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'algorithm');
    }
    this.crsAlgorithm = id;
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
 * Read header from stream
 * @param {BinaryStream} stm
 * @return {KdbxHeader}
 */
KdbxHeader.read = function(stm) {
    var header = new KdbxHeader();
    while (header._readField(stm)) {
        continue;
    }
    header.endPos = stm.pos;
    header._validate();
    return header;
};

module.exports = KdbxHeader;
