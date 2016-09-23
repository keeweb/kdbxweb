'use strict';

if (!global.crypto && global.msCrypto) {
    var subtle = global.msCrypto.subtle;

    global.Promise = require('promise-polyfill');

    var toPromise = function(op) {
        return new Promise(function(resolve, reject) {
            op.oncomplete = function(e) { resolve(e.target.result); };
            op.onerror = function(e) { reject(e.target.result); };
        });
    };

    var jsSha = require('jssha/src/sha512');
    var ByteUtils = require('../utils/byte-utils');

    global.crypto = {
        getRandomValues: global.msCrypto.getRandomValues.bind(global.msCrypto),
        subtle: {
            digest: function(algo, data) {
                if (algo.name === 'SHA-512') {
                    var sha = new jsSha('SHA-512', 'HEX');
                    sha.update(ByteUtils.bytesToHex(data));
                    var hash = sha.getHash('HEX');
                    hash = ByteUtils.arrayToBuffer(ByteUtils.hexToBytes(hash));
                    return Promise.resolve(hash);
                }
                return toPromise(subtle.digest(algo, data));
            },
            importKey: function(format, key, algo, exportable, usage) {
                return toPromise(subtle.importKey(format, key, algo, exportable, usage));
            },
            sign: function(algo, key, data) {
                return toPromise(subtle.sign(algo, key, data));
            },
            encrypt: function(algo, key, data) {
                return toPromise(subtle.encrypt(algo, key, data));
            },
            decrypt: function(algo, key, data) {
                return toPromise(subtle.decrypt(algo, key, data));
            }
        }
    };
}
