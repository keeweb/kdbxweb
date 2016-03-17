'use strict';

if (!global.crypto && typeof Buffer !== 'undefined') {
    var nodeCrypto = require('crypto');

    /* globals Promise */

    global.crypto = {
        subtle: {
            importKey: function(format, keyData) {
                var key = new ArrayBuffer(keyData.byteLength);
                new Uint8Array(key).set(new Uint8Array(keyData));
                return new Promise(function(resolve) {
                    resolve(key);
                });
            },
            encrypt: function(algo, key, cleartext) {
                return new Promise(function(resolve) {
                    var cipher = nodeCrypto.createCipheriv('aes-256-cbc',
                        new Buffer(new Uint8Array(key)),
                        new Buffer(new Uint8Array(algo.iv)));
                    var data = cipher.update(new Buffer(new Uint8Array(cleartext)));
                    data = new Uint8Array(Buffer.concat([data, cipher.final()])).buffer;
                    resolve(data);
                });
            }
        },
        getRandomValues: function(arr) {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = Math.random() * 255;
            }
        }
    };
}
