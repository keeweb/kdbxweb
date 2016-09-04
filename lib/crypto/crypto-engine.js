'use strict';

var subtle = global.crypto ? global.crypto.subtle || global.crypto.webkitSubtle : null;
var nodeCrypto = global.process && global.process.versions && global.process.versions.node ? require('crypro') : null;

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
        return Promise.reject('SHA256 is not implemented');
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
        return Promise.reject('HMAC-SHA256 is not implemented');
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
    return Promise.reject('Argon2 is not implemented');
}

module.exports.subtle = subtle;
module.exports.nodeCrypto = nodeCrypto;

module.exports.sha256 = sha256;
module.exports.hmacSha256 = hmacSha256;
module.exports.argon2 = argon2;
