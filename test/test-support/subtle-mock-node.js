'use strict';

var SubtleMockNode;

if (global.process && global.process.versions && global.process.versions.node) {
    var nodeCrypto = require('crypto');

    SubtleMockNode = {
        subtle: {
            importKey: function(format, keyData) {
                var key = new ArrayBuffer(keyData.byteLength);
                new Uint8Array(key).set(new Uint8Array(keyData));
                return Promise.resolve(key);
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
            },
            decrypt: function(algo, key, cleartext) {
                return new Promise(function(resolve) {
                    var cipher = nodeCrypto.createDecipheriv('aes-256-cbc',
                        new Buffer(new Uint8Array(key)),
                        new Buffer(new Uint8Array(algo.iv)));
                    var data = cipher.update(new Buffer(new Uint8Array(cleartext)));
                    data = new Uint8Array(Buffer.concat([data, cipher.final()])).buffer;
                    resolve(data);
                });
            },
            digest: function(format, data) {
                return new Promise(function(resolve) {
                    resolve(nodeCrypto.createHash(format.name.replace('-', '').toLowerCase())
                        .update(Buffer.from(data)).digest().buffer);
                });
            },
            sign: function(algo, key, data) {
                return new Promise(function(resolve) {
                    resolve(nodeCrypto.createHmac('sha256', Buffer.from(key)).update(Buffer.from(data)).digest().buffer);
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

module.exports = SubtleMockNode;
