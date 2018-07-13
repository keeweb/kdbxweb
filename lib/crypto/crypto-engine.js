'use strict';

var ByteUtils = require('../utils/byte-utils'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts'),
    ChaCha20 = require('./chacha20');

var webCrypto = global.crypto;
var subtle = webCrypto ? webCrypto.subtle || webCrypto.webkitSubtle : null;
var nodeCrypto = global.process && global.process.versions && global.process.versions.node ? require('crypto') : null;

var EmptySha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
var EmptySha512 = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce' +
    '47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';
// maxRandomQuota is the max number of random bytes you can asks for from the cryptoEngine
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
var maxRandomQuota = 65536;


/**
 * SHA-256 hash
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function sha256(data) {
    if (!data.byteLength) {
        return Promise.resolve(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes(EmptySha256)));
    }
    if (subtle) {
        return subtle.digest({ name: 'SHA-256' }, data);
    } else if (nodeCrypto) {
        return new Promise(function(resolve) {
            var sha = nodeCrypto.createHash('sha256');
            var hash = sha.update(Buffer.from(data)).digest();
            resolve(hash.buffer);
        });
    } else {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'SHA256 not implemented'));
    }
}

/**
 * SHA-512 hash
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function sha512(data) {
    if (!data.byteLength) {
        return Promise.resolve(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes(EmptySha512)));
    }
    if (subtle) {
        return subtle.digest({ name: 'SHA-512' }, data);
    } else if (nodeCrypto) {
        return new Promise(function(resolve) {
            var sha = nodeCrypto.createHash('sha512');
            var hash = sha.update(Buffer.from(data)).digest();
            resolve(hash.buffer);
        });
    } else {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'SHA512 not implemented'));
    }
}

/**
 * HMAC-SHA-256 hash
 * @param {ArrayBuffer} key
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function hmacSha256(key, data) {
    if (subtle) {
        var algo = { name: 'HMAC', hash: { name: 'SHA-256' } };
        return subtle.importKey('raw', key, algo, false, ['sign'])
            .then(function(subtleKey) {
                return subtle.sign(algo, subtleKey, data);
            });
    } else if (nodeCrypto) {
        return new Promise(function(resolve) {
            var hmac = nodeCrypto.createHmac('sha256', Buffer.from(key));
            var hash = hmac.update(Buffer.from(data)).digest();
            resolve(hash.buffer);
        });
    } else {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'HMAC-SHA256 not implemented'));
    }
}

/**
 * AES-CBC using WebCrypto
 * @constructor
 */
function AesCbcSubtle() {
}

AesCbcSubtle.prototype.importKey = function(key) {
    var that = this;
    return subtle.importKey('raw', key, {name: 'AES-CBC'}, false, ['encrypt', 'decrypt'])
        .then(function(key) { that.key = key; });
};

AesCbcSubtle.prototype.encrypt = function(data, iv) {
    return subtle.encrypt({name: 'AES-CBC', iv: iv}, this.key, data);
};

AesCbcSubtle.prototype.decrypt = function(data, iv) {
    return subtle.decrypt({name: 'AES-CBC', iv: iv}, this.key, data)
        .catch(function() { throw new KdbxError(Consts.ErrorCodes.InvalidKey, 'invalid key'); });
};

/**
 * AES-CBC using node crypto
 * @constructor
 */
function AesCbcNode() {
}

AesCbcNode.prototype.importKey = function(key) {
    this.key = key;
    return Promise.resolve();
};

AesCbcNode.prototype.encrypt = function(data, iv) {
    var that = this;
    return Promise.resolve().then(function() {
        var cipher = nodeCrypto.createCipheriv('aes-256-cbc', Buffer.from(that.key), Buffer.from(iv));
        var block = cipher.update(Buffer.from(data));
        return ByteUtils.arrayToBuffer(Buffer.concat([block, cipher.final()]));
    });
};

AesCbcNode.prototype.decrypt = function(data, iv) {
    var that = this;
    return Promise.resolve().then(function() {
        var cipher = nodeCrypto.createDecipheriv('aes-256-cbc', Buffer.from(that.key), Buffer.from(iv));
        var block = cipher.update(Buffer.from(data));
        return ByteUtils.arrayToBuffer(Buffer.concat([block, cipher.final()]));
    }).catch(function() { throw new KdbxError(Consts.ErrorCodes.InvalidKey, 'invalid key'); });
};

/**
 * Creates AES-CBC implementation
 * @returns AesCbc
 */
function createAesCbc() {
    if (subtle) {
        return new AesCbcSubtle();
    } else if (nodeCrypto) {
        return new AesCbcNode();
    } else {
        throw new KdbxError(Consts.ErrorCodes.NotImplemented, 'AES-CBC not implemented');
    }
}

/**
 * Gets random bytes from the CryptoEngine
 * @param {number} len - bytes count
 * @return {Uint8Array} - random bytes
 */
function safeRandom(len) {
    var randomBytes = new Uint8Array(len);
    while (len > 0) {
        var segmentSize = len % maxRandomQuota;
        segmentSize = segmentSize > 0 ? segmentSize : maxRandomQuota;
        var randomBytesSegment = new Uint8Array(segmentSize);
        webCrypto.getRandomValues(randomBytesSegment);
        len -= segmentSize;
        randomBytes.set(randomBytesSegment, len);
    }
    return randomBytes;
}

/**
 * Generates random bytes of specified length
 * @param {Number} len
 * @returns {Uint8Array}
 */
function random(len) {
    if (subtle) {
        return safeRandom(len);
    } else if (nodeCrypto) {
        return new Uint8Array(nodeCrypto.randomBytes(len));
    } else {
        throw new KdbxError(Consts.ErrorCodes.NotImplemented, 'Random not implemented');
    }
}

/**
 * Encrypts with ChaCha20
 * @param {ArrayBuffer} data
 * @param {ArrayBuffer} key
 * @param {ArrayBuffer} iv
 * @returns {Promise.<ArrayBuffer>}
 */
function chacha20(data, key, iv) {
    return Promise.resolve().then(function() {
        var algo = new ChaCha20(new Uint8Array(key), new Uint8Array(iv));
        return ByteUtils.arrayToBuffer(algo.encrypt(new Uint8Array(data)));
    });
}

/**
 * Argon2 hash
 * @param {ArrayBuffer} password
 * @param {ArrayBuffer} salt
 * @param {Number} memory - memory in KiB
 * @param {Number} iterations - number of iterations
 * @param {Number} length - hash length
 * @param {Number} parallelism - threads count (threads will be emulated if they are not supported)
 * @param {Number} type - 0 = argon2d, 1 = argon2i
 * @param {Number} version - 0x10 or 0x13
 * @returns {Promise.<ArrayBuffer>}
 */
function argon2(password, salt, memory, iterations, length, parallelism, type, version) { // jshint ignore:line
    return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'Argon2 not implemented'));
}

/**
 * Configures globals, for tests
 */
function configure(newSubtle, newWebCrypto, newNodeCrypto) {
    subtle = newSubtle;
    webCrypto = newWebCrypto;
    nodeCrypto = newNodeCrypto;
}

module.exports.subtle = subtle;
module.exports.webCrypto = webCrypto;
module.exports.nodeCrypto = nodeCrypto;

module.exports.sha256 = sha256;
module.exports.sha512 = sha512;
module.exports.hmacSha256 = hmacSha256;
module.exports.random = random;
module.exports.createAesCbc = createAesCbc;
module.exports.chacha20 = chacha20;
module.exports.argon2 = argon2;

module.exports.configure = configure;
