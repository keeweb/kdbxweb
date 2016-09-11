'use strict';

var Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    VarDictionary = require('../utils/var-dictionary'),
    Int64 = require('../utils/int64'),
    CryptoEngine = require('../crypto/crypto-engine'),
    KdbxError = require('../errors/kdbx-error');

var KdfFields = [
    { name: 'salt', field: 'S', type: VarDictionary.ValueType.Bytes },
    { name: 'parallelism', field: 'P', type: VarDictionary.ValueType.UInt32 },
    { name: 'memory', field: 'M', type: VarDictionary.ValueType.UInt64 },
    { name: 'iterations', field: 'I', type: VarDictionary.ValueType.UInt64 },
    { name: 'version', field: 'V', type: VarDictionary.ValueType.UInt64 },
    { name: 'secretKey', field: 'K', type: VarDictionary.ValueType.Bytes },
    { name: 'assocData', field: 'A', type: VarDictionary.ValueType.Bytes }
];

/**
 * Derives key from seed using KDF parameters
 * @param {ArrayBuffer} key
 * @param {VarDictionary} kdfParams
 */
function encrypt(key, kdfParams) {
    var kdfUuid = ByteUtils.bytesToBase64(kdfParams.get('$UUID'));
    switch (kdfUuid) {
        case Consts.KdfId.Argon2:
            return encryptArgon2(key, kdfParams);
        default:
            return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'bad kdf'));
    }
}

function encryptArgon2(key, kdfParams) {
    var params = {};
    KdfFields.forEach(function(fieldDef) {
        var value = kdfParams.get(fieldDef.field);
        if (value) {
            if (value instanceof Int64) {
                value = value.value;
            }
            params[fieldDef.name] = value;
        }
    });
    if (!(params.salt instanceof ArrayBuffer) || params.salt.byteLength !== 32) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 salt'));
    }
    if (typeof params.parallelism !== 'number' || params.parallelism < 1) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 parallelism'));
    }
    if (typeof params.iterations !== 'number' || params.iterations < 1) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 iterations'));
    }
    if (typeof params.memory !== 'number' || params.memory < 1 || params.memory % 1024 !== 0) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 memory'));
    }
    if (params.version !== 0x13 && params.version !== 0x10) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 version'));
    }
    if (params.secretKey) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'argon2 secret key'));
    }
    if (params.assocData) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'argon2 assoc data'));
    }
    return CryptoEngine.argon2(key, params.salt,
        params.memory / 1024, params.iterations,
        32, params.parallelism, 0, params.version);
}

module.exports.encrypt = encrypt;
