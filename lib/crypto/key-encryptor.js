'use strict';

var Promise = require('bluebird'),
    ByteUtils = require('./../utils/byte-utils'),
    asmCrypto = require('asmcrypto.js');
var subtle = global.crypto ? global.crypto.subtle || global.crypto.webkitSubtle : null;

var maxRoundsPreIteration = 10000;
var aesBlockSize = 16;
var credentialSize = 32;

function encrypt(credentials, key, rounds, callback) {
    var result;
    if (!subtle) {
        result = Promise.reject('No subtle crypto');
    } else {
        result = Promise.resolve()
            .then(function() {
                return subtle.importKey('raw', key, {name: 'AES-CBC'}, false, ['encrypt']);
            })
            .then(function(encKey) {
                var resolvers = [];
                for (var idx = 0; idx < credentialSize; idx += aesBlockSize) {
                    resolvers.push(encryptBlock(
                        credentials.subarray(idx, idx + aesBlockSize), encKey, rounds));
                }
                return Promise.all(resolvers);
            })
            .then(function(results) {
                var concat = new Uint8Array(credentialSize);

                results.forEach(function (result, idx) {
                    var base = idx * aesBlockSize;
                    for (var i = 0; i < aesBlockSize; ++i) {
                        concat[i + base] = result[i];
                    }
                    ByteUtils.zeroBuffer(result);
                });

                return concat;
            });
    }

    result
        .catch(function() {
            return fallbackEncrypt(credentials, key, rounds);
        })
        .then(callback);
}

function encryptBlock(iv, encKey, rounds) {
    var result = Promise.resolve(iv);
    var buffer = new Uint8Array(aesBlockSize * Math.min(rounds, maxRoundsPreIteration));

    while (rounds > 0) {
        var currentRounds = Math.min(rounds, maxRoundsPreIteration);
        rounds -= currentRounds;

        var dataLen = aesBlockSize * currentRounds;
        var zeroData = buffer.length === dataLen ? buffer : buffer.subarray(0, dataLen);
        result = encryptBlockBuffer(result, encKey, zeroData);
    }

    return result;
}

function encryptBlockBuffer(promisedIv, encKey, buffer) {
    return promisedIv
        .then(function(iv) {
            return subtle.encrypt({name: 'AES-CBC', iv: iv}, encKey, buffer);
        })
        .then(function(buf) {
            var data = new Uint8Array(buf);
            var nextIv = data.slice(-2 * aesBlockSize, -aesBlockSize);
            ByteUtils.zeroBuffer(data);
            return nextIv;
        });
}

function fallbackEncrypt(credentials, key, rounds) {
    return Promise.resolve(asmCrypto.AES_ECB.encrypt(credentials, key, false, rounds));
}

module.exports.encrypt = encrypt;
module.exports.fallbackEncrypt = fallbackEncrypt;
