'use strict';

var asmCrypto = require('asmcrypto.js');
var subtle = global.crypto ? global.crypto.subtle || global.crypto.webkitSubtle : null;
var MaxRoundsPreIteration = 10000;

function encrypt(data, key, rounds, callback) {
    if (!subtle) {
        fallbackEncrypt(data, key, rounds, callback);
    } else {
        try {
            subtle.importKey('raw', key, {name: 'AES-CBC'}, false, ['encrypt']).then(function (encKey) {
                var result = new Uint8Array(32);
                var partsLeft = 2;
                encryptBlock(data.subarray(0, 16), encKey, rounds, result, function (enc) {
                    if (!enc && !--partsLeft) {
                        return fallbackEncrypt(data, key, rounds, callback);
                    }
                    for (var i = 0; i < 16; i++) {
                        result[i] = enc[i];
                    }
                    if (!--partsLeft) {
                        callback(result);
                    }
                });
                encryptBlock(data.subarray(16), encKey, rounds, result, function (enc) {
                    if (!enc && !--partsLeft) {
                        return fallbackEncrypt(data, key, rounds, callback);
                    }
                    for (var i = 0; i < 16; i++) {
                        result[i + 16] = enc[i];
                    }
                    if (!--partsLeft) {
                        callback(result);
                    }
                });
            }).catch(function () {
                fallbackEncrypt(data, key, rounds, callback);
            });
        } catch (e) {
            fallbackEncrypt(data, key, rounds, callback);
        }
    }
}

function encryptBlock(iv, encKey, rounds, result, complete, buffer) {
    var actualRounds = Math.min(MaxRoundsPreIteration, rounds);
    var leftRounds = rounds - actualRounds;
    var dataLen = 16 * actualRounds;
    var zeroData = buffer ? buffer.length === dataLen ? buffer : buffer.subarray(0, dataLen) : new Uint8Array(dataLen);
    try {
        subtle.encrypt({name: 'AES-CBC', iv: iv}, encKey, zeroData).then(function (encData) {
            var encDataArr = new Uint8Array(encData, (actualRounds - 1) * 16, 16);
            if (leftRounds) {
                encryptBlock(encDataArr, encKey, leftRounds, result, complete, buffer || zeroData);
            } else {
                complete(encDataArr);
            }
        }).catch(function () {
            complete();
        });
    } catch (e) {
        complete();
    }
}

function fallbackEncrypt(data, key, rounds, callback) {
    callback(asmCrypto.AES_ECB.encrypt(data, key, false, rounds));
}

module.exports.encrypt = encrypt;
module.exports.fallbackEncrypt = fallbackEncrypt;
