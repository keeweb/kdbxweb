'use strict';

var ProtectedValue = require('../crypto/protected-value'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ByteUtils = require('../utils/byte-utils'),
    asmCrypto = require('asmcrypto.js');

/**
 * Credentials
 * @param {ProtectedValue} password
 * @param {ProtectedValue} keyFile
 * @constructor
 */
var KdbxCredentials = function(password, keyFile) {
    if (!(password instanceof ProtectedValue)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'password');
    }
    if (keyFile && !(keyFile instanceof ProtectedValue)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'keyFile');
    }
    var bytes = password.getHash();
    var sha256 = new asmCrypto.SHA256().reset();
    sha256.process(bytes);
    ByteUtils.zeroBuffer(bytes);
    if (keyFile) {
        bytes = keyFile.getHash();
        sha256.process(bytes);
        ByteUtils.zeroBuffer(bytes);
    }
    var hash = sha256.finish().result;
    this.hash = ProtectedValue.fromBinary(hash);
    ByteUtils.zeroBuffer(hash);
};

module.exports = KdbxCredentials;
