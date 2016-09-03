'use strict';

/**
 * SHA-256 hash
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
function sha256(data) {
    return new Promise(function() { throw 'TODO'; });
}

/**
 * HMAC-SHA-256 hash
 * @param {Uint8Array} key
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
function hmacSha256(key, data) {
    return new Promise(function() { throw 'TODO'; });
}

/**
 * Argon2 hash
 * @param {Uint8Array} password
 * @param {Uint8Array} salt
 * @param {Number} memory - memory in KiB
 * @param {Number} iterations - number of iterations
 * @param {Number} length - hash length
 * @param {Number} parallelism - threads count (threads will be emulated if they are not supported)
 * @param {Number} type - 0 = argon2d, 1 = argon2i
 * @returns {Promise<Uint8Array>}
 */
function argon2(password, salt, memory, iterations, length, parallelism, type) {
    return new Promise(function() { throw 'TODO'; });
}

module.exports.sha256 = sha256;
module.exports.hmacSha256 = hmacSha256;
module.exports.argon2 = argon2;
