'use strict';

var asmCrypto = require('asmcrypto.js');
var subtle = global.crypto ? global.crypto.subtle || global.crypto.webkitSubtle : null;

var maxRoundsPreIteration = 10000;
var aesBlockSize = 16;
var credentialSize = 32;
var maxBufferSize = aesBlockSize * maxRoundsPreIteration;

function encrypt(credentials, key, rounds, callback) {
    if (!subtle) {
        fallbackEncrypt(credentials, key, rounds, callback);
        return;
    } else {
        Promise.resolve()
            .then(function() {
                return subtle.importKey('raw', key, {name: 'AES-CBC'}, false, ['encrypt']);
            })
            .then(function(encKey) {
                var resolvers = [];
                for (var idx=0; idx<credentialSize; idx += aesBlockSize) {
                    resolvers.push(encryptBlock(
                        credentials.subarray(idx, idx+aesBlockSize), encKey, rounds));
                }
                return Promise.all(resolvers)
            })
            .then(function(results) {
                var concat = new Uint8Array(credentialSize);

                results.forEach(function (result, idx) {
                    var base = idx * aesBlockSize;
                    for (var i=0; i<aesBlockSize; ++i) {
                        concat[i + base] = result[i];
                    }
                });

                return concat;
            })
            .then(callback, function(err) {
                fallbackEncrypt(credentials, key, rounds, callback);
            });
    }
}

function encryptBlock(iv, encKey, rounds) {
    if (!subtle) {
        return Promise.reject("No subtle crypto");
    }

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
        .then(function(data) {
            return new Uint8Array(data, data.byteLength - 2*aesBlockSize, aesBlockSize);
        })
}

function fallbackEncrypt(credentials, key, rounds, callback) {
    callback(asmCrypto.AES_ECB.encrypt(credentials, key, false, rounds));
}

module.exports.encrypt = encrypt;
module.exports.fallbackEncrypt = fallbackEncrypt;
