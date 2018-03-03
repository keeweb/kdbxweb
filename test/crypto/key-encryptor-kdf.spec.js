'use strict';

var expect = require('expect.js'),
    KeyEncryptorKdf = require('../../lib/crypto/key-encryptor-kdf'),
    CryptoEngine = require('../../lib/crypto/crypto-engine'),
    Consts = require('../../lib/defs/consts'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    Int64 = require('../../lib/utils/int64'),
    VarDictionary = require('../../lib/utils/var-dictionary');

describe('KeyEncryptorKdf', function() {
    var data = ByteUtils.hexToBytes('5d18f8a5ae0e7ea86f0ad817f0c0d40656ef1da6367d8a88508b3c13cec0d7af');
    var exp = '5d00000401200200130000000000000000000000000000000000000000000000';

    var cryptoEngineArgon2 = CryptoEngine.argon2;

    before(function() {
        CryptoEngine.argon2 = function(password, salt, memory, iterations, length, parallelism, type, version) {
            var res = new ArrayBuffer(32);
            var view = new DataView(res);
            view.setUint8(0, password[0]);
            view.setUint8(1, salt[0]);
            view.setInt16(2, memory);
            view.setInt8(4, iterations);
            view.setInt8(5, length);
            view.setInt8(6, parallelism);
            view.setInt8(7, type);
            view.setInt8(8, version);
            return Promise.resolve(res);
        };
    });

    after(function() {
        CryptoEngine.argon2 = cryptoEngineArgon2;
    });

    it('calls argon2 function', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        var salt = new Uint8Array(32);
        salt[0] = 42;
        params.set('S', VarDictionary.ValueType.Bytes, salt);
        params.set('P', VarDictionary.ValueType.UInt32, 2);
        params.set('I', VarDictionary.ValueType.UInt64, new Int64(1));
        params.set('M', VarDictionary.ValueType.UInt64, new Int64(1024 * 4));
        params.set('V', VarDictionary.ValueType.UInt32, 0x13);
        return KeyEncryptorKdf.encrypt(data, params).then(function(res) {
            expect(ByteUtils.bytesToHex(res)).to.be(exp);
        });
    });

    it('throws error for no uuid', function() {
        var params = new VarDictionary();
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: no kdf uuid');
            });
    });

    it('throws error for invalid uuid', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('Unsupported: bad kdf');
            });
    });

    it('throws error for bad salt', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(10));
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: bad argon2 salt');
            });
    });

    it('throws error for bad parallelism', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', VarDictionary.ValueType.Int32, -1);
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: bad argon2 parallelism');
            });
    });

    it('throws error for bad iterations', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', VarDictionary.ValueType.Int32, 1);
        params.set('I', VarDictionary.ValueType.Int32, -1);
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: bad argon2 iterations');
            });
    });

    it('throws error for bad memory', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', VarDictionary.ValueType.Int32, 1);
        params.set('I', VarDictionary.ValueType.Int32, 1);
        params.set('M', VarDictionary.ValueType.Int32, 123);
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: bad argon2 memory');
            });
    });

    it('throws error for bad version', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', VarDictionary.ValueType.Int32, 1);
        params.set('I', VarDictionary.ValueType.Int32, 1);
        params.set('M', VarDictionary.ValueType.Int32, 1024);
        params.set('V', VarDictionary.ValueType.Int32, 5);
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: bad argon2 version');
            });
    });

    it('throws error for secret key', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', VarDictionary.ValueType.Int32, 1);
        params.set('I', VarDictionary.ValueType.Int32, 1);
        params.set('M', VarDictionary.ValueType.Int32, 1024);
        params.set('V', VarDictionary.ValueType.Int32, 0x10);
        params.set('K', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('Unsupported: argon2 secret key');
            });
    });

    it('throws error for assoc data', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', VarDictionary.ValueType.Int32, 1);
        params.set('I', VarDictionary.ValueType.Int32, 1);
        params.set('M', VarDictionary.ValueType.Int32, 1024);
        params.set('V', VarDictionary.ValueType.Int32, 0x13);
        params.set('A', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('Unsupported: argon2 assoc data');
            });
    });

    it('calls aes function', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Aes));
        var key = ByteUtils.hexToBytes('ee66af917de0b0336e659fe6bd40a337d04e3c2b3635210fa16f28fb24d563ac');
        var salt = ByteUtils.hexToBytes('5d18f8a5ae0e7ea86f0ad817f0c0d40656ef1da6367d8a88508b3c13cec0d7af');
        var result = 'af0be2c639224ad37bd2bc7967d6c3303a8a6d4b7813718918a66bde96dc3132';
        params.set('S', VarDictionary.ValueType.Bytes, salt);
        params.set('R', VarDictionary.ValueType.Int64, new Int64(2));
        return KeyEncryptorKdf.encrypt(key, params).then(function(res) {
            expect(ByteUtils.bytesToHex(res)).to.be(result);
        });
    });

    it('throws error for bad aes salt', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Aes));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(10));
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: bad aes salt');
            });
    });

    it('throws error for bad aes rounds', function() {
        var params = new VarDictionary();
        params.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Aes));
        params.set('S', VarDictionary.ValueType.Bytes, new ArrayBuffer(32));
        params.set('R', VarDictionary.ValueType.Int64, new Int64(-1));
        return KeyEncryptorKdf.encrypt(data, params).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('FileCorrupt: bad aes rounds');
            });
    });
});
