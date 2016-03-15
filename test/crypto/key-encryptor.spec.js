'use strict';

require('../test-support/crypto-mock-node');

var expect = require('expect.js'),
    KeyEncryptor = require('../../lib/crypto/key-encryptor'),
    asmCrypto = require('asmcrypto.js');

describe('KeyEncryptor', function() {
    var subtle = global.crypto ? global.crypto.subtle || global.crypto.webkitSubtle : undefined;

    /* jshint camelcase:false */
    /* globals Promise */

    var data = asmCrypto.hex_to_bytes('5d18f8a5ae0e7ea86f0ad817f0c0d40656ef1da6367d8a88508b3c13cec0d7af');
    var key = asmCrypto.hex_to_bytes('ee66af917de0b0336e659fe6bd40a337d04e3c2b3635210fa16f28fb24d563ac');

    it('decrypts one round with fallback algorithm', function(done) {
        KeyEncryptor.fallbackEncrypt(data, key, 1, function(res) {
            expect(asmCrypto.bytes_to_hex(res)).to.be('46e891c182a31d005a8990ac5d61bb2124ffe5927fa008a739a9b0d217c79717');
            done();
        });
    });

    it('decrypts one round with default algorithm', function(done) {
        KeyEncryptor.encrypt(data, key, 1, function(res) {
            expect(asmCrypto.bytes_to_hex(res)).to.be('46e891c182a31d005a8990ac5d61bb2124ffe5927fa008a739a9b0d217c79717');
            done();
        });
    });

    if (subtle !== undefined) {
        it('uses fallback encryption if webcrypto.importKey generates promise error', function (done) {
            var oldImportKey = subtle.importKey;
            subtle.importKey = function () { return new Promise(function (resolve, reject) { reject('fail'); }); };
            KeyEncryptor.encrypt(data, key, 1, function (res) {
                subtle.importKey = oldImportKey;
                expect(asmCrypto.bytes_to_hex(res)).to.be('46e891c182a31d005a8990ac5d61bb2124ffe5927fa008a739a9b0d217c79717');
                done();
            });
        });

        it('uses fallback encryption if webcrypto.encrypt generates promise error', function (done) {
            var oldEncrypt = subtle.encrypt;
            subtle.encrypt = function () { return new Promise(function (resolve, reject) { reject('fail'); }); };
            KeyEncryptor.encrypt(data, key, 1, function (res) {
                subtle.encrypt = oldEncrypt;
                expect(asmCrypto.bytes_to_hex(res)).to.be('46e891c182a31d005a8990ac5d61bb2124ffe5927fa008a739a9b0d217c79717');
                done();
            });
        });

        it('uses fallback encryption if webcrypto.importKey throws an error', function (done) {
            var oldImportKey = subtle.importKey;
            subtle.importKey = function () { throw 'err'; };
            KeyEncryptor.encrypt(data, key, 1, function (res) {
                subtle.importKey = oldImportKey;
                expect(asmCrypto.bytes_to_hex(res)).to.be('46e891c182a31d005a8990ac5d61bb2124ffe5927fa008a739a9b0d217c79717');
                done();
            });
        });

        it('uses fallback encryption if webcrypto.encrypt throws an error', function (done) {
            var oldImportKey = subtle.encrypt;
            subtle.encrypt = function () { throw 'err'; };
            KeyEncryptor.encrypt(data, key, 1, function (res) {
                subtle.encrypt = oldImportKey;
                expect(asmCrypto.bytes_to_hex(res)).to.be('46e891c182a31d005a8990ac5d61bb2124ffe5927fa008a739a9b0d217c79717');
                done();
            });
        });

    }

    it('decrypts two rounds with fallback algorithm', function(done) {
        KeyEncryptor.fallbackEncrypt(data, key, 2, function(res) {
            expect(asmCrypto.bytes_to_hex(res)).to.be('1818f732cb1a933911ec90baed252d388980cd3665e1009705e5007aa48ad916');
            done();
        });
    });

    it('decrypts two rounds with default algorithm', function(done) {
        KeyEncryptor.encrypt(data, key, 2, function(res) {
            expect(asmCrypto.bytes_to_hex(res)).to.be('1818f732cb1a933911ec90baed252d388980cd3665e1009705e5007aa48ad916');
            done();
        });
    });

    it('decrypts many rounds with fallback algorithm', function(done) {
        KeyEncryptor.fallbackEncrypt(data, key, 10021, function(res) {
            expect(asmCrypto.bytes_to_hex(res)).to.be('64d62f7ec4a363ff0fbb4520163b478ef4d0d631b690a2e7daa6bc09bca092df');
            done();
        });
    });

    it('decrypts many rounds with default algorithm', function(done) {
        KeyEncryptor.encrypt(data, key, 10021, function(res) {
            expect(asmCrypto.bytes_to_hex(res)).to.be('64d62f7ec4a363ff0fbb4520163b478ef4d0d631b690a2e7daa6bc09bca092df');
            done();
        });
    });
});
