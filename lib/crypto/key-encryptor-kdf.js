'use strict';

var Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    VarDictionary = require('../utils/var-dictionary'),
    Int64 = require('../utils/int64'),
    CryptoEngine = require('../crypto/crypto-engine'),
    KdbxError = require('../errors/kdbx-error'),
    KeyEncryptorAes = require('./key-encryptor-aes');

var KdfFields = [
    { name: 'salt', field: 'S', type: VarDictionary.ValueType.Bytes },
    { name: 'parallelism', field: 'P', type: VarDictionary.ValueType.UInt32 },
    { name: 'memory', field: 'M', type: VarDictionary.ValueType.UInt64 },
    { name: 'iterations', field: 'I', type: VarDictionary.ValueType.UInt64 },
    { name: 'version', field: 'V', type: VarDictionary.ValueType.UInt32 },
    { name: 'secretKey', field: 'K', type: VarDictionary.ValueType.Bytes },
    { name: 'assocData', field: 'A', type: VarDictionary.ValueType.Bytes },
    { name: 'rounds', field: 'R', type: VarDictionary.ValueType.UInt64 }
];

/**
 * Derives key from seed using KDF parameters
 * @param {ArrayBuffer} key
 * @param {VarDictionary} kdfParams
 */
function encrypt(key, kdfParams) {
    var uuid = kdfParams.get('$UUID');
    if (!uuid || !(uuid instanceof ArrayBuffer)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no kdf uuid'));
    }
    var kdfUuid = ByteUtils.bytesToBase64(uuid);
    switch (kdfUuid) {
        case Consts.KdfId.Argon2d:
            return encryptArgon2(key, kdfParams, CryptoEngine.Argon2TypeArgon2d);
        case Consts.KdfId.Argon2id:
            return encryptArgon2(key, kdfParams, CryptoEngine.Argon2TypeArgon2id);
        case Consts.KdfId.Aes:
            return encryptAes(key, kdfParams);
        default:
            return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'bad kdf'));
    }
}

function decodeParams(kdfParams) {
    var params = {};
    KdfFields.forEach(function (fieldDef) {
        var value = kdfParams.get(fieldDef.field);
        if (value) {
            if (value instanceof Int64) {
                value = value.value;
            }
            params[fieldDef.name] = value;
        }
    });
    return params;
}

function encryptArgon2(key, kdfParams, argon2type) {
    var params = decodeParams(kdfParams);
    if (!(params.salt instanceof ArrayBuffer) || params.salt.byteLength !== 32) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 salt'));
    }
    if (typeof params.parallelism !== 'number' || params.parallelism < 1) {
        return Promise.reject(
            new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 parallelism')
        );
    }
    if (typeof params.iterations !== 'number' || params.iterations < 1) {
        return Promise.reject(
            new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 iterations')
        );
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
    return CryptoEngine.argon2(
        key,
        params.salt,
        params.memory / 1024,
        params.iterations,
        32,
        params.parallelism,
        argon2type,
        params.version
    );
}

function encryptAes(key, kdfParams) {
    var params = decodeParams(kdfParams);
    if (!(params.salt instanceof ArrayBuffer) || params.salt.byteLength !== 32) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad aes salt'));
    }
    if (typeof params.rounds !== 'number' || params.rounds < 1) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad aes rounds'));
    }
    return KeyEncryptorAes.encrypt(
        new Uint8Array(key),
        new Uint8Array(params.salt),
        params.rounds
    ).then(function (key) {
        return CryptoEngine.sha256(key).then(function (hash) {
            ByteUtils.zeroBuffer(key);
            return hash;
        });
    });
}

module.exports.encrypt = encrypt;
