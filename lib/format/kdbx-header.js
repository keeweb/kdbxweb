'use strict';

var KdbxUuid = require('./kdbx-uuid'),
    Consts = require('./../defs/consts'),
    ProtectedValue = require('./../crypto/protected-value'),
    KdbxError = require('./../errors/kdbx-error'),
    BinaryStream = require('./../utils/binary-stream'),
    ByteUtils = require('./../utils/byte-utils'),
    VarDictionary = require('./../utils/var-dictionary'),
    Random = require('../crypto/random');

var HeaderFields = [
    { name: 'EndOfHeader' },

    { name: 'Comment' },
    { name: 'CipherID' },
    { name: 'CompressionFlags' },
    { name: 'MasterSeed' },
    { name: 'TransformSeed', ver: [3] },
    { name: 'TransformRounds', ver: [3] },
    { name: 'EncryptionIV' },
    { name: 'ProtectedStreamKey', ver: [3] },
    { name: 'StreamStartBytes', ver: [3] },
    { name: 'InnerRandomStreamID', ver: [3] },

    { name: 'KdfParameters', ver: [4] },
    { name: 'PublicCustomData', ver: [4] }
];

var InnerHeaderFields = [
    { name: 'EndOfHeader' },

    { name: 'InnerRandomStreamID' },
    { name: 'InnerRandomStreamKey' },
    { name: 'Binary' }
];

var HeaderConst = {
    DefaultFileVersionMajor: 3,
    DefaultFileVersionMinor: 1,
    MaxSupportedVersion: 4,
    FlagBinaryProtected: 0x01,
    InnerHeaderBinaryFieldId: 0x03
};

/**
 * Binary file header reader/writer
 * @param {Kdbx} kdbx
 * @constructor
 */
var KdbxHeader = function(kdbx) {
    this.kdbx = kdbx;
    this.versionMajor = undefined;
    this.versionMinor = undefined;
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
    this.kdfParameters = undefined;
    this.publicCustomData = undefined;
    Object.preventExtensions(this);
};

KdbxHeader.prototype._readSignature = function(stm) {
    var sig1 = stm.getUint32(true), sig2 = stm.getUint32(true);
    if (!(sig1 === Consts.Signatures.FileMagic && sig2 === Consts.Signatures.Sig2Kdbx)) {
        throw new KdbxError(Consts.ErrorCodes.BadSignature);
    }
};

KdbxHeader.prototype._writeSignature = function(stm) {
    stm.setUint32(Consts.Signatures.FileMagic, true);
    stm.setUint32(Consts.Signatures.Sig2Kdbx, true);
};

KdbxHeader.prototype._readVersion = function(stm) {
    var versionMinor = stm.getUint16(true);
    var versionMajor = stm.getUint16(true);
    if (versionMajor > HeaderConst.MaxSupportedVersion) {
        throw new KdbxError(Consts.ErrorCodes.InvalidVersion);
    }
    this.versionMinor = versionMinor;
    this.versionMajor = versionMajor;
};

KdbxHeader.prototype._writeVersion = function(stm) {
    stm.setUint16(this.versionMinor, true);
    stm.setUint16(this.versionMajor, true);
};

KdbxHeader.prototype._readCipherID = function(bytes) {
    if (bytes.byteLength !== 16) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'cipher');
    }
    this.dataCipherUuid = new KdbxUuid(bytes);
};

KdbxHeader.prototype._writeCipherID = function(stm) {
    this._writeFieldSize(stm, 16);
    stm.writeBytes(this.dataCipherUuid.bytes);
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
    stm.setUint64(this.keyEncryptionRounds, true);
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
    this.crsAlgorithm = new DataView(bytes).getUint32(bytes, true);
};

KdbxHeader.prototype._writeInnerRandomStreamID = function(stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(this.crsAlgorithm, true);
};

KdbxHeader.prototype._readInnerRandomStreamKey = function(bytes) {
    this.protectedStreamKey = bytes;
};

KdbxHeader.prototype._writeInnerRandomStreamKey = function(stm) {
    this._writeFieldBytes(stm, this.protectedStreamKey);
};

KdbxHeader.prototype._readKdfParameters = function(bytes) {
    this.kdfParameters = VarDictionary.read(new BinaryStream(bytes));
};

KdbxHeader.prototype._writeKdfParameters = function(stm) {
    this.kdfParameters.write(stm);
};

KdbxHeader.prototype._readPublicCustomData = function(bytes) {
    this.publicCustomData = VarDictionary.read(new BinaryStream(bytes));
};

KdbxHeader.prototype._writePublicCustomData = function(stm) {
    if (this.publicCustomData) {
        this.publicCustomData.write(stm);
    }
};

KdbxHeader.prototype._readBinary = function(bytes) {
    var view = new DataView(bytes);
    var flags = view.getUint8(0);
    var isProtected = flags & HeaderConst.FlagBinaryProtected;
    var binaryData = bytes.slice(1);

    var binary = isProtected ? ProtectedValue.fromBinary(binaryData) : binaryData;

    var binaryIndex = Object.keys(this.kdbx.binaries).length;
    this.kdbx.binaries[binaryIndex] = binary;
};

KdbxHeader.prototype._writeBinary = function(stm) {
    if (this.versionMajor < 4) {
        return;
    }
    var binaryIds = Object.keys(this.kdbx.binaries);
    for (var binaryId = 0; binaryId < binaryIds; binaryId++) {
        if (binaryId > 0) {
            stm.setUint8(HeaderConst.InnerHeaderBinaryFieldId);
        }
        var binary = this.kdbx.binaries[binaryId];
        if (!binary) {
            throw new KdbxError(Consts.ErrorCodes.NotImplemented, 'no binary ' + binaryId);
        }
        if (binary instanceof ProtectedValue) {
            var binaryData = binary.getBinary();
            this._writeFieldSize(stm, binaryData.byteLength);
            stm.setUint8(HeaderConst.FlagBinaryProtected);
            stm.writeBytes(binaryData);
            ByteUtils.zeroBuffer(binaryData);
        } else {
            binary = ByteUtils.arrayToBuffer(binary);
            this._writeFieldSize(stm, binary.byteLength);
            stm.setUint8(0);
            stm.writeBytes(binary);
        }
    }
};

KdbxHeader.prototype._writeEndOfHeader = function(stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(0x0d0ad0a);
};

KdbxHeader.prototype._readField = function(stm, fields) {
    var headerId = stm.getUint8();
    var size = this._readFieldSize(stm);
    var bytes;
    if (size > 0) {
        bytes = stm.readBytes(size);
    }
    var headerField = fields[headerId];
    if (headerField) {
        var method = this['_read' + headerField.name];
        if (method) {
            method.call(this, bytes);
        }
    }
    return headerId !== 0;
};

KdbxHeader.prototype._writeField = function(stm, headerId) {
    var headerField = HeaderFields[headerId];
    if (headerField) {
        if (headerField.ver && headerField.ver.indexOf(this.versionMajor) < 0) {
            return;
        }
        var method = this['_write' + headerField.name];
        if (method) {
            stm.setUint8(headerId);
            method.call(this, stm);
        }
    }
};

KdbxHeader.prototype._readFieldSize = function(stm) {
    return this.versionMajor >= 4 ? stm.getUint32(true) : stm.getUint16(true);
};

KdbxHeader.prototype._writeFieldSize = function(stm, size) {
    if (this.versionMajor >= 4) {
        stm.setUint32(size, true);
    } else {
        stm.setUint16(size, true);
    }
};

KdbxHeader.prototype._writeFieldBytes = function(stm, bytes) {
    this._writeFieldSize(stm, bytes.byteLength);
    stm.writeBytes(bytes);
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
    if (this.versionMajor < 4 && !this.transformSeed) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no transform seed in header');
    }
    if (this.versionMajor < 4 && !this.keyEncryptionRounds) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no key encryption rounds in header');
    }
    if (!this.encryptionIV) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no encryption iv in header');
    }
    if (this.versionMajor < 4 && !this.protectedStreamKey) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no protected stream key in header');
    }
    if (this.versionMajor < 4 && !this.streamStartBytes) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no stream start bytes in header');
    }
    if (this.versionMajor < 4 && !this.crsAlgorithm) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no crs algorithm in header');
    }
    if (this.versionMajor >= 4 && !this.kdfParameters) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no kdf parameters in header');
    }
};

KdbxHeader.prototype._validateInner = function() {
    if (!this.protectedStreamKey) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no protected stream key in header');
    }
    if (!this.crsAlgorithm) {
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
    for (var id = 1; id < HeaderFields.length; id++) {
        this._writeField(stm, id);
    }
    this._writeField(stm, 0);
    this.endPos = stm.pos;
};

/**
 * Updates header random salts
 */
KdbxHeader.prototype.generateSalts = function() {
    this.masterSeed = Random.getBytes(32);
    this.transformSeed = Random.getBytes(32);
    this.encryptionIV = Random.getBytes(16);
    this.protectedStreamKey = Random.getBytes(32);
    this.streamStartBytes = Random.getBytes(32);
};

/**
 * Reads inner header from stream
 * @param {BinaryStream} stm
 */
KdbxHeader.prototype.readInnerHeader = function(stm) {
    while (this._readField(stm, InnerHeaderFields)) {
        continue;
    }
    this._validateInner();
};

/**
 * Read header from stream
 * @param {BinaryStream} stm
 * @param {Kdbx} kdbx
 * @return {KdbxHeader}
 * @static
 */
KdbxHeader.read = function(stm, kdbx) {
    var header = new KdbxHeader(kdbx);
    header._readSignature(stm);
    header._readVersion(stm);
    while (header._readField(stm, HeaderFields)) {
        continue;
    }
    header.endPos = stm.pos;
    header._validate();
    return header;
};

/**
 * Creates new header
 * @param {Kdbx} kdbx
 * @return {KdbxHeader}
 * @static
 */
KdbxHeader.create = function(kdbx) {
    var header = new KdbxHeader(kdbx);
    header.versionMajor = HeaderConst.DefaultFileVersionMajor;
    header.versionMinor = HeaderConst.DefaultFileVersionMinor;
    header.dataCipherUuid = new KdbxUuid(Consts.CipherId.Aes);
    header.compression = Consts.CompressionAlgorithm.GZip;
    header.keyEncryptionRounds = Consts.Defaults.KeyEncryptionRounds;
    header.crsAlgorithm = Consts.CrsAlgorithm.Salsa20;
    return header;
};

module.exports = KdbxHeader;
