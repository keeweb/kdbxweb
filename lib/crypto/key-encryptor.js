'use strict';

var ByteUtils = require('./../utils/byte-utils'),
    CryptoEngine = require('./crypto-engine');

var maxRoundsPreIteration = 10000;
var aesBlockSize = 16;
var credentialSize = 32;

/*
In order to simulate multiple rounds of ECB encryption, we do CBC encryption
across a zero buffer of large length with the IV being the desired plaintext.
The zero buffer does not contribute to the xor, so xoring the previous block
with the next one simulates running ECB multiple times. We limit the maximum
size of the zero buffer to prevent enormous memory usage.
*/

function encrypt(credentials, key, rounds) {
    var algo = new CryptoEngine.AesCbc();
    return algo.importKey(key)
        .then(function() {
            var resolvers = [];
            for (var idx = 0; idx < credentialSize; idx += aesBlockSize) {
                resolvers.push(encryptBlock(algo,
                    credentials.subarray(idx, idx + aesBlockSize), rounds));
            }
            return Promise.all(resolvers);
        })
        .then(function(results) {
            console.log('res', results);
            var res = new Uint8Array(credentialSize);
            results.forEach(function (result, idx) {
                var base = idx * aesBlockSize;
                for (var i = 0; i < aesBlockSize; ++i) {
                    res[i + base] = result[i];
                }
                ByteUtils.zeroBuffer(result);
            });
            return res;
        });
}

function encryptBlock(algo, iv, rounds) {
    var result = Promise.resolve(iv);
    var buffer = new Uint8Array(aesBlockSize * Math.min(rounds, maxRoundsPreIteration));

    while (rounds > 0) {
        var currentRounds = Math.min(rounds, maxRoundsPreIteration);
        rounds -= currentRounds;

        var dataLen = aesBlockSize * currentRounds;
        var zeroData = buffer.length === dataLen ? buffer : buffer.subarray(0, dataLen);
        result = encryptBlockBuffer(algo, result, zeroData);
    }

    return result;
}

function encryptBlockBuffer(algo, promisedIv, buffer) {
    return promisedIv
        .then(function(iv) {
            return algo.encrypt(buffer, iv);
        })
        .then(function(buf) {
            var data = new Uint8Array(buf);
            var nextIv = data.slice(-2 * aesBlockSize, -aesBlockSize);
            ByteUtils.zeroBuffer(data);
            return nextIv;
        });
}

module.exports.encrypt = encrypt;
