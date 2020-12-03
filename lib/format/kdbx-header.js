'use strict';

/* Docs for the KDBX header schema:
 * https://keepass.info/help/kb/kdbx_4.html#innerhdr
 */

var KdbxUuid = require('./kdbx-uuid'),
    Consts = require('./../defs/consts'),
    ProtectedValue = require('./../crypto/protected-value'),
    KdbxError = require('./../errors/kdbx-error'),
    BinaryStream = require('./../utils/binary-stream'),
    ByteUtils = require('./../utils/byte-utils'),
    VarDictionary = require('./../utils/var-dictionary'),
    Int64 = require('./../utils/int64'),
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
    { name: 'Binary', skipHeader: true }
];

var HeaderConst = {
    DefaultFileVersionMajor: 4,
    DefaultFileVersionMinor: 0,
    MaxFileVersionMajor: 4,
    MaxFileVersionMinor: 1,
    MaxSupportedVersion: 4,
    FlagBinaryProtected: 0x01,
    InnerHeaderBinaryFieldId: 0x03,

    DefaultKdfAlgo: Consts.KdfId.Argon2d,
    DefaultKdfSaltLength: 32,
    DefaultKdfParallelism: 1,
    DefaultKdfIterations: 2,
    DefaultKdfMemory: 1024 * 1024,
    DefaultKdfVersion: 0x13
};

var LastMinorVersions = {
    3: 1,
    4: 0
};

/**
 * Binary file header reader/writer
 * @constructor
 */
var KdbxHeader = function () {
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

KdbxHeader.prototype._readSignature = function (stm) {
    if (stm.byteLength < 8) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'not enough data');
    }
    var sig1 = stm.getUint32(true),
        sig2 = stm.getUint32(true);
    if (!(sig1 === Consts.Signatures.FileMagic && sig2 === Consts.Signatures.Sig2Kdbx)) {
        throw new KdbxError(Consts.ErrorCodes.BadSignature);
    }
};

KdbxHeader.prototype._writeSignature = function (stm) {
    stm.setUint32(Consts.Signatures.FileMagic, true);
    stm.setUint32(Consts.Signatures.Sig2Kdbx, true);
};

KdbxHeader.prototype._readVersion = function (stm) {
    var versionMinor = stm.getUint16(true);
    var versionMajor = stm.getUint16(true);
    if (versionMajor > HeaderConst.MaxSupportedVersion) {
        throw new KdbxError(Consts.ErrorCodes.InvalidVersion);
    }
    this.versionMinor = versionMinor;
    this.versionMajor = versionMajor;
};

KdbxHeader.prototype._writeVersion = function (stm) {
    stm.setUint16(this.versionMinor, true);
    stm.setUint16(this.versionMajor, true);
};

KdbxHeader.prototype._readCipherID = function (bytes) {
    if (bytes.byteLength !== 16) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'cipher');
    }
    this.dataCipherUuid = new KdbxUuid(bytes);
};

KdbxHeader.prototype._writeCipherID = function (stm) {
    this._writeFieldSize(stm, 16);
    stm.writeBytes(this.dataCipherUuid.bytes);
};

KdbxHeader.prototype._readCompressionFlags = function (bytes) {
    var id = new DataView(bytes).getUint32(bytes, true);
    if (id < 0 || id >= Object.keys(Consts.CompressionAlgorithm).length) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'compression');
    }
    this.compression = id;
};

KdbxHeader.prototype._writeCompressionFlags = function (stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(this.compression, true);
};

KdbxHeader.prototype._readMasterSeed = function (bytes) {
    this.masterSeed = bytes;
};

KdbxHeader.prototype._writeMasterSeed = function (stm) {
    this._writeFieldBytes(stm, this.masterSeed);
};

KdbxHeader.prototype._readTransformSeed = function (bytes) {
    this.transformSeed = bytes;
};

KdbxHeader.prototype._writeTransformSeed = function (stm) {
    this._writeFieldBytes(stm, this.transformSeed);
};

KdbxHeader.prototype._readTransformRounds = function (bytes) {
    this.keyEncryptionRounds = new BinaryStream(bytes).getUint64(true);
};

KdbxHeader.prototype._writeTransformRounds = function (stm) {
    this._writeFieldSize(stm, 8);
    stm.setUint64(this.keyEncryptionRounds, true);
};

KdbxHeader.prototype._readEncryptionIV = function (bytes) {
    this.encryptionIV = bytes;
};

KdbxHeader.prototype._writeEncryptionIV = function (stm) {
    this._writeFieldBytes(stm, this.encryptionIV);
};

KdbxHeader.prototype._readProtectedStreamKey = function (bytes) {
    this.protectedStreamKey = bytes;
};

KdbxHeader.prototype._writeProtectedStreamKey = function (stm) {
    this._writeFieldBytes(stm, this.protectedStreamKey);
};

KdbxHeader.prototype._readStreamStartBytes = function (bytes) {
    this.streamStartBytes = bytes;
};

KdbxHeader.prototype._writeStreamStartBytes = function (stm) {
    this._writeFieldBytes(stm, this.streamStartBytes);
};

KdbxHeader.prototype._readInnerRandomStreamID = function (bytes) {
    this.crsAlgorithm = new DataView(bytes).getUint32(bytes, true);
};

KdbxHeader.prototype._writeInnerRandomStreamID = function (stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(this.crsAlgorithm, true);
};

KdbxHeader.prototype._readInnerRandomStreamKey = function (bytes) {
    this.protectedStreamKey = bytes;
};

KdbxHeader.prototype._writeInnerRandomStreamKey = function (stm) {
    this._writeFieldBytes(stm, this.protectedStreamKey);
};

KdbxHeader.prototype._readKdfParameters = function (bytes) {
    this.kdfParameters = VarDictionary.read(new BinaryStream(bytes));
};

KdbxHeader.prototype._writeKdfParameters = function (stm) {
    var innerStream = new BinaryStream();
    this.kdfParameters.write(innerStream);
    this._writeFieldBytes(stm, innerStream.getWrittenBytes());
};

KdbxHeader.prototype._readPublicCustomData = function (bytes) {
    this.publicCustomData = VarDictionary.read(new BinaryStream(bytes));
};

KdbxHeader.prototype._hasPublicCustomData = function () {
    return this.publicCustomData;
};

KdbxHeader.prototype._writePublicCustomData = function (stm) {
    if (this.publicCustomData) {
        var innerStream = new BinaryStream();
        this.publicCustomData.write(innerStream);
        this._writeFieldBytes(stm, innerStream.getWrittenBytes());
    }
};

KdbxHeader.prototype._readBinary = function (bytes, ctx) {
    var view = new DataView(bytes);
    var flags = view.getUint8(0);
    var isProtected = flags & HeaderConst.FlagBinaryProtected;
    var binaryData = bytes.slice(1); // Actual data comes after the flag byte

    var binary = isProtected ? ProtectedValue.fromBinary(binaryData) : binaryData;

    var binaryIndex = Object.keys(ctx.kdbx.binaries).length;
    ctx.kdbx.binaries[binaryIndex] = binary;
};

KdbxHeader.prototype._writeBinary = function (stm, ctx) {
    if (this.versionMajor < 4) {
        return;
    }
    var binaryHashes = ctx.kdbx.binaries.hashOrder;
    for (var index = 0; index < binaryHashes.length; index++) {
        stm.setUint8(HeaderConst.InnerHeaderBinaryFieldId);
        var binary = ctx.kdbx.binaries[binaryHashes[index]];
        if (!binary) {
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no binary ' + index);
        }
        if (binary instanceof ProtectedValue) {
            var binaryData = binary.getBinary();
            this._writeFieldSize(stm, binaryData.byteLength + 1);
            stm.setUint8(HeaderConst.FlagBinaryProtected);
            stm.writeBytes(binaryData);
            ByteUtils.zeroBuffer(binaryData);
        } else {
            binary = ByteUtils.arrayToBuffer(binary);
            this._writeFieldSize(stm, binary.byteLength + 1);
            stm.setUint8(0);
            stm.writeBytes(binary);
        }
    }
};

KdbxHeader.prototype._writeEndOfHeader = function (stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(0x0d0ad0a);
};

KdbxHeader.prototype._readField = function (stm, fields, ctx) {
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
            method.call(this, bytes, ctx);
        }
    }
    return headerId !== 0;
};

KdbxHeader.prototype._writeField = function (stm, headerId, fields, ctx) {
    var headerField = fields[headerId];
    if (headerField) {
        if (headerField.ver && headerField.ver.indexOf(this.versionMajor) < 0) {
            return;
        }
        var method = this['_write' + headerField.name];
        if (method) {
            var hasMethod = this['_has' + headerField.name];
            if (hasMethod && !hasMethod.call(this)) {
                return;
            }
            if (!headerField.skipHeader) {
                stm.setUint8(headerId);
            }
            method.call(this, stm, ctx);
        }
    }
};

KdbxHeader.prototype._readFieldSize = function (stm) {
    return this.versionMajor >= 4 ? stm.getUint32(true) : stm.getUint16(true);
};

KdbxHeader.prototype._writeFieldSize = function (stm, size) {
    if (this.versionMajor >= 4) {
        stm.setUint32(size, true);
    } else {
        stm.setUint16(size, true);
    }
};

KdbxHeader.prototype._writeFieldBytes = function (stm, bytes) {
    this._writeFieldSize(stm, bytes.byteLength);
    stm.writeBytes(bytes);
};

KdbxHeader.prototype._validate = function () {
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

KdbxHeader.prototype._validateInner = function () {
    if (!this.protectedStreamKey) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no protected stream key in header');
    }
    if (!this.crsAlgorithm) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no crs algorithm in header');
    }
};

KdbxHeader.prototype._createKdfParameters = function (algo) {
    if (!algo) {
        algo = HeaderConst.DefaultKdfAlgo;
    }
    switch (algo) {
        case Consts.KdfId.Argon2d:
            this.kdfParameters = new VarDictionary();
            this.kdfParameters.set(
                '$UUID',
                VarDictionary.ValueType.Bytes,
                ByteUtils.base64ToBytes(Consts.KdfId.Argon2d)
            );
            this.kdfParameters.set(
                'S',
                VarDictionary.ValueType.Bytes,
                Random.getBytes(HeaderConst.DefaultKdfSaltLength)
            );
            this.kdfParameters.set(
                'P',
                VarDictionary.ValueType.UInt32,
                HeaderConst.DefaultKdfParallelism
            );
            this.kdfParameters.set(
                'I',
                VarDictionary.ValueType.UInt64,
                new Int64(HeaderConst.DefaultKdfIterations)
            );
            this.kdfParameters.set(
                'M',
                VarDictionary.ValueType.UInt64,
                new Int64(HeaderConst.DefaultKdfMemory)
            );
            this.kdfParameters.set(
                'V',
                VarDictionary.ValueType.UInt32,
                HeaderConst.DefaultKdfVersion
            );
            break;
        case Consts.KdfId.Aes:
            this.kdfParameters = new VarDictionary();
            this.kdfParameters.set(
                '$UUID',
                VarDictionary.ValueType.Bytes,
                ByteUtils.base64ToBytes(Consts.KdfId.Aes)
            );
            this.kdfParameters.set(
                'S',
                VarDictionary.ValueType.Bytes,
                Random.getBytes(HeaderConst.DefaultKdfSaltLength)
            );
            this.kdfParameters.set(
                'R',
                VarDictionary.ValueType.UInt64,
                new Int64(Consts.Defaults.KeyEncryptionRounds)
            );
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'bad KDF algo');
    }
};

/**
 * Saves header to stream
 * @param {BinaryStream} stm
 */
KdbxHeader.prototype.write = function (stm) {
    this._validate();
    this._writeSignature(stm);
    this._writeVersion(stm);
    for (var id = 1; id < HeaderFields.length; id++) {
        this._writeField(stm, id, HeaderFields);
    }
    this._writeField(stm, 0, HeaderFields);
    this.endPos = stm.pos;
};

/**
 * Saves inner header to stream
 * @param {BinaryStream} stm
 * @param {KdbxContext} ctx
 */
KdbxHeader.prototype.writeInnerHeader = function (stm, ctx) {
    this._validateInner();
    for (var id = 1; id < InnerHeaderFields.length; id++) {
        this._writeField(stm, id, InnerHeaderFields, ctx);
    }
    this._writeField(stm, 0, InnerHeaderFields);
};

/**
 * Updates header random salts
 */
KdbxHeader.prototype.generateSalts = function () {
    this.masterSeed = Random.getBytes(32);
    if (this.versionMajor < 4) {
        this.transformSeed = Random.getBytes(32);
        this.streamStartBytes = Random.getBytes(32);
        this.protectedStreamKey = Random.getBytes(32);
        this.encryptionIV = Random.getBytes(16);
    } else {
        this.protectedStreamKey = Random.getBytes(64);
        this.kdfParameters.set('S', VarDictionary.ValueType.Bytes, Random.getBytes(32));
        var ivLength = this.dataCipherUuid.toString() === Consts.CipherId.ChaCha20 ? 12 : 16;
        this.encryptionIV = Random.getBytes(ivLength);
    }
};

/**
 * Upgrade the header to the specified version
 * @param {Number} version - major file version
 */
KdbxHeader.prototype.setVersion = function (version) {
    if (version !== 3 && version !== 4) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'bad file version');
    }
    this.versionMajor = version;
    this.versionMinor = LastMinorVersions[version];
    if (this.versionMajor === 4) {
        if (!this.kdfParameters) {
            this._createKdfParameters();
        }
        this.crsAlgorithm = Consts.CrsAlgorithm.ChaCha20;
        this.keyEncryptionRounds = undefined;
    } else {
        this.kdfParameters = undefined;
        this.crsAlgorithm = Consts.CrsAlgorithm.Salsa20;
        this.keyEncryptionRounds = Consts.Defaults.KeyEncryptionRounds;
    }
};

/**
 * Set file KDF
 * @param kdf - KDF ID, from Consts.KdfId
 */
KdbxHeader.prototype.setKdf = function (kdf) {
    this._createKdfParameters(kdf);
};

/**
 * Read header from stream
 * @param {BinaryStream} stm
 * @param {KdbxContext} ctx
 * @return {KdbxHeader}
 * @static
 */
KdbxHeader.read = function (stm, ctx) {
    var header = new KdbxHeader();
    header._readSignature(stm);
    header._readVersion(stm);
    while (header._readField(stm, HeaderFields, ctx)) {
        continue;
    }
    header.endPos = stm.pos;
    header._validate();
    return header;
};

/**
 * Reads inner header from stream
 * @param {BinaryStream} stm
 * @param {KdbxContext} ctx
 */
KdbxHeader.prototype.readInnerHeader = function (stm, ctx) {
    while (this._readField(stm, InnerHeaderFields, ctx)) {
        continue;
    }
    this._validateInner();
};

/**
 * Creates new header
 * @param {Kdbx} kdbx
 * @return {KdbxHeader}
 * @static
 */
KdbxHeader.create = function () {
    var header = new KdbxHeader();
    header.versionMajor = HeaderConst.DefaultFileVersionMajor;
    header.versionMinor = HeaderConst.DefaultFileVersionMinor;
    header.dataCipherUuid = new KdbxUuid(Consts.CipherId.Aes);
    header.compression = Consts.CompressionAlgorithm.GZip;
    header.crsAlgorithm = Consts.CrsAlgorithm.ChaCha20;
    header._createKdfParameters();
    return header;
};

KdbxHeader.MaxFileVersion = HeaderConst.MaxFileVersionMajor;

module.exports = KdbxHeader;
