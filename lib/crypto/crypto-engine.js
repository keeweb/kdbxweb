'use strict';

var ByteUtils = require('../utils/byte-utils'),
    KdbxError = require('../errors/kdbx-error'),
    Consts = require('../defs/consts');

var webCrypto = global.crypto;
var subtle = webCrypto ? webCrypto.subtle || webCrypto.webkitSubtle : null;
var nodeCrypto = global.process && global.process.versions && global.process.versions.node ? require('crypto') : null;

/**
 * SHA-256 hash
 * @param {ArrayBuffer} data
 * @returns {Promise<ArrayBuffer>}
 */
function sha256(data) {
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
 * HMAC-SHA-256 hash
 * @param {ArrayBuffer} key
 * @param {ArrayBuffer} data
 * @returns {Promise<ArrayBuffer>}
 */
function hmacSha256(key, data) {
    if (subtle) {
        return subtle.importKey('raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign'])
            .then(function(subtleKey) {
                return subtle.sign({ name: 'HMAC' }, subtleKey, data);
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
    return subtle.importKey('raw', key, {name: 'AES-CBC'}, false, ['encrypt'])
        .then(function(key) { that.key = key; });
};

AesCbcSubtle.prototype.encrypt = function(data, iv) {
    return subtle.encrypt({name: 'AES-CBC', iv: iv}, this.key, data);
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
 * Generates random bytes of specified length
 * @param {Number} len
 * @returns {Uint8Array}
 */
function random(len) {
    if (subtle) {
        var cryptoBytes = new Uint8Array(len);
        webCrypto.getRandomValues(cryptoBytes);
        return cryptoBytes;
    } else if (nodeCrypto) {
        return new Uint8Array(nodeCrypto.randomBytes(len));
    } else {
        throw new KdbxError(Consts.ErrorCodes.NotImplemented, 'Random not implemented');
    }
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
 * @returns {Promise<ArrayBuffer>}
 */
function argon2(password, salt, memory, iterations, length, parallelism, type) { // jshint ignore:line
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
module.exports.hmacSha256 = hmacSha256;
module.exports.random = random;
module.exports.createAesCbc = createAesCbc;
module.exports.argon2 = argon2;

module.exports.configure = configure;
