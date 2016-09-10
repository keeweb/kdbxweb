'use strict';

var expect = require('expect.js'),
    KeyEncryptorAes = require('../../lib/crypto/key-encryptor-aes'),
    ByteUtils = require('../../lib/utils/byte-utils');

describe('KeyEncryptorAes', function() {
    var data = ByteUtils.hexToBytes('5d18f8a5ae0e7ea86f0ad817f0c0d40656ef1da6367d8a88508b3c13cec0d7af');
    var key = ByteUtils.hexToBytes('ee66af917de0b0336e659fe6bd40a337d04e3c2b3635210fa16f28fb24d563ac');

    it('decrypts one round', function() {
        return KeyEncryptorAes.encrypt(data, key, 1).then(function(res) {
            expect(ByteUtils.bytesToHex(res)).to.be('46e891c182a31d005a8990ac5d61bb2124ffe5927fa008a739a9b0d217c79717');
        });
    });

    it('decrypts two rounds', function() {
        return KeyEncryptorAes.encrypt(data, key, 2).then(function(res) {
            expect(ByteUtils.bytesToHex(res)).to.be('1818f732cb1a933911ec90baed252d388980cd3665e1009705e5007aa48ad916');
        });
    });

    it('decrypts many rounds', function() {
        return KeyEncryptorAes.encrypt(data, key, 10021).then(function(res) {
            expect(ByteUtils.bytesToHex(res)).to.be('64d62f7ec4a363ff0fbb4520163b478ef4d0d631b690a2e7daa6bc09bca092df');
        });
    });
});
