'use strict';

var asmCrypto = require('asmcrypto.js');
var subtle = global.crypto ? global.crypto.subtle || global.crypto.webkitSubtle || global.crypto.msSubtle : null;

function encrypt(data, key, rounds, callback) {
    if (!subtle) {
        fallbackEncrypt(data, key, rounds, callback);
    } else {
        subtle.importKey('raw', key.buffer, {name: 'AES-CBC'}, false, ['encrypt']).then(function (encKey) {
            var zeroData = new Uint8Array(16 * rounds);
            var result = new Uint8Array(32);
            var partsLeft = 2;
            encryptBlock(data, encKey, zeroData, rounds, result, 0, function() {
                if (!--partsLeft) {
                    callback(result);
                }
            });
            encryptBlock(data, encKey, zeroData, rounds, result, 16, function() {
                if (!--partsLeft) {
                    callback(result);
                }
            });
        }).catch(function() {
            fallbackEncrypt(data, key, rounds, callback);
        });
    }
}

function encryptBlock(iv, encKey, zeroData, rounds, result, offset, complete) {
    subtle.encrypt({name: 'AES-CBC', iv: iv.subarray(offset, offset + 16)}, encKey, zeroData).then(function (encData) {
        var encDataArr = new Uint8Array(encData, (rounds - 1) * 16, 16);
        for (var i = 0; i < 16; i++) {
            result[offset + i] = encDataArr[i];
        }
        complete(new Uint8Array(encData, rounds * 16 - 16, 16));
    });
}

function fallbackEncrypt(data, key, rounds, callback) {
    callback(asmCrypto.AES_ECB.encrypt(data, key, false, rounds));
}

module.exports.encrypt = encrypt;
module.exports.fallbackEncrypt = encrypt;
