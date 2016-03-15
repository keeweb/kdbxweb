'use strict';

var asmCrypto = require('asmcrypto.js');
var subtle = global.crypto ? global.crypto.subtle || global.crypto.webkitSubtle : null;

var maxRoundsPreIteration = 10000;
var aesBlockSize = 16;
var credentialSize = 32;
var maxBufferSize = aesBlockSize * maxRoundsPreIteration;

function encrypt(credentials, key, rounds, callback) {
    var result = Promise.resolve();
    if (!subtle) {
        result = Promise.reject("No subtle crypto");
    } else {
        result = result
            .then(function() {
                return subtle.importKey('raw', key, {name: 'AES-CBC'}, false, ['encrypt']);
            })
            .then(function(encKey) {
                var resolvers = [];
                for (var idx=0; idx<credentialSize; idx += aesBlockSize) {
                    resolvers.push(encryptBlock(
                        credentials.subarray(idx, aesBlockSize), encKey, rounds));
                }
                return Promise.all(resolvers)
            })
            .then(function(results) {
                var concat = new Uint8Array(credentialSize);

                results.forEach(function(result, idx) {
                    var base = idx * aesBlockSize;
                    for (var i=0; i<aesBlockSize; ++i) {
                        concat[i + base] = result[i];
                    }
                });

                return concat;
            });
    }

    result.then(callback, function(err) {
        fallbackEncrypt(credentials, key, rounds, callback);
    });
}

function encryptBlock(iv, encKey, rounds, buffer) {
    if (!subtle) {
        return Promise.reject("No subtle crypto");
    }

    var actualRounds = rounds;
    var roundCap = buffer && buffer.length >= aesBlockSize ?
        Math.floor(buffer.length / aesBlockSize) : maxRoundsPreIteration;

    var result = Promise.resolve(iv);

    for (var roundsLeft = rounds; roundsLeft > 0; roundsLeft -= roundCap) {
        var actualRounds = Math.max(roundsLeft, roundsCap);
        var dataLen = actualRounds * aesBlockSize;
        if (!buffer) {
            buffer = new Uint8Array(dataLen);
        }
        var zeroData = buffer.length === dataLen ? buffer : buffer.subarray(0, dataLen);
        result = result
            .then(function (iv) {
                return subtle.encrypt({name: 'AES-CBC', iv: iv}, encKey, zeroData);
            }).then(function (data) {
                return new Uint8Array(data, (actualRounds - 1) * aesBlockSize, aesBlockSize);
            });
    }

    return result;
}

function fallbackEncrypt(credentials, key, rounds, callback) {
    return Promise.resolve(asmCrypto.AES_ECB.encrypt(credentials, key, false, rounds));
}

module.exports.encrypt = encrypt;
module.exports.fallbackEncrypt = fallbackEncrypt;
