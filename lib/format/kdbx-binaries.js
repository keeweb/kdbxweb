'use strict';

var ProtectedValue = require('./../crypto/protected-value'),
    CryptoEngine = require('./../crypto/crypto-engine'),
    ByteUtils = require('./../utils/byte-utils');

var KdbxBinaries = function () {
    Object.defineProperties(this, {
        idToHash: { value: {} },
        hashOrder: { value: null, configurable: true }
    });
};

KdbxBinaries.prototype.hash = function () {
    var promises = [];
    var that = this;
    Object.keys(that).forEach(function (id) {
        var binary = that[id];
        promises.push(
            that.getBinaryHash(binary).then(function (hash) {
                that.idToHash[id] = hash;
                that[hash] = that[id];
                delete that[id];
            })
        );
    });
    return Promise.all(promises);
};

KdbxBinaries.prototype.getBinaryHash = function (binary) {
    var promise;
    if (binary instanceof ProtectedValue) {
        promise = binary.getHash();
    } else if (binary instanceof ArrayBuffer || binary instanceof Uint8Array) {
        binary = ByteUtils.arrayToBuffer(binary);
        promise = CryptoEngine.sha256(binary);
    }
    return promise.then(function (hash) {
        return ByteUtils.bytesToHex(hash);
    });
};

KdbxBinaries.prototype.assignIds = function () {
    Object.defineProperty(this, 'hashOrder', { value: Object.keys(this), configurable: true });
};

KdbxBinaries.prototype.add = function (value) {
    var that = this;
    return this.getBinaryHash(value).then(function (hash) {
        that[hash] = value;
        return { ref: hash, value: value };
    });
};

module.exports = KdbxBinaries;
