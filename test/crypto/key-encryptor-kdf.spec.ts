import expect from 'expect.js';
import { ByteUtils, Consts, CryptoEngine, Int64, KeyEncryptorKdf, VarDictionary } from '../../lib';
import { ValueType } from '../../lib/utils/var-dictionary';

describe('KeyEncryptorKdf', () => {
    const data = ByteUtils.arrayToBuffer(
        ByteUtils.hexToBytes('5d18f8a5ae0e7ea86f0ad817f0c0d40656ef1da6367d8a88508b3c13cec0d7af')
    );
    const exp = '5d2a000401200200130000000000000000000000000000000000000000000000';

    const cryptoEngineArgon2 = CryptoEngine.argon2;

    before(() => {
        CryptoEngine.setArgon2Impl(
            (password, salt, memory, iterations, length, parallelism, type, version) => {
                const res = new ArrayBuffer(32);
                const view = new DataView(res);
                view.setUint8(0, new Uint8Array(password)[0]);
                view.setUint8(1, new Uint8Array(salt)[0]);
                view.setInt16(2, memory);
                view.setInt8(4, iterations);
                view.setInt8(5, length);
                view.setInt8(6, parallelism);
                view.setInt8(7, type);
                view.setInt8(8, version);
                return Promise.resolve(res);
            }
        );
    });

    after(() => {
        CryptoEngine.argon2 = cryptoEngineArgon2;
    });

    it('calls argon2 function', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        const saltArr = new Uint8Array(32);
        saltArr[0] = 42;
        const salt = ByteUtils.arrayToBuffer(saltArr);
        params.set('S', ValueType.Bytes, salt);
        params.set('P', ValueType.UInt32, 2);
        params.set('I', ValueType.UInt64, new Int64(1));
        params.set('M', ValueType.UInt64, new Int64(1024 * 4));
        params.set('V', ValueType.UInt32, 0x13);
        return KeyEncryptorKdf.encrypt(data, params).then((res) => {
            expect(ByteUtils.bytesToHex(res)).to.be(exp);
        });
    });

    it('throws error for no uuid', () => {
        const params = new VarDictionary();
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: no kdf uuid');
            });
    });

    it('throws error for invalid uuid', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, new ArrayBuffer(32));
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('Unsupported: bad kdf');
            });
    });

    it('throws error for bad salt', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(10));
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad argon2 salt');
            });
    });

    it('throws error for bad parallelism', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', ValueType.Int32, -1);
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad argon2 parallelism');
            });
    });

    it('throws error for bad parallelism type', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', ValueType.String, 'xxx');
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad argon2 parallelism');
            });
    });

    it('throws error for bad iterations', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', ValueType.Int32, 1);
        params.set('I', ValueType.Int32, -1);
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad argon2 iterations');
            });
    });

    it('throws error for bad memory', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', ValueType.Int32, 1);
        params.set('I', ValueType.Int32, 1);
        params.set('M', ValueType.Int32, 123);
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad argon2 memory');
            });
    });

    it('throws error for bad version', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', ValueType.Int32, 1);
        params.set('I', ValueType.Int32, 1);
        params.set('M', ValueType.Int32, 1024);
        params.set('V', ValueType.Int32, 5);
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad argon2 version');
            });
    });

    it('throws error for secret key', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', ValueType.Int32, 1);
        params.set('I', ValueType.Int32, 1);
        params.set('M', ValueType.Int32, 1024);
        params.set('V', ValueType.Int32, 0x10);
        params.set('K', ValueType.Bytes, new ArrayBuffer(32));
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('Unsupported: argon2 secret key');
            });
    });

    it('throws error for assoc data', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('P', ValueType.Int32, 1);
        params.set('I', ValueType.Int32, 1);
        params.set('M', ValueType.Int32, 1024);
        params.set('V', ValueType.Int32, 0x13);
        params.set('A', ValueType.Bytes, new ArrayBuffer(32));
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('Unsupported: argon2 assoc data');
            });
    });

    it('calls aes function', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Aes));
        const key = ByteUtils.hexToBytes(
            'ee66af917de0b0336e659fe6bd40a337d04e3c2b3635210fa16f28fb24d563ac'
        );
        const salt = ByteUtils.hexToBytes(
            '5d18f8a5ae0e7ea86f0ad817f0c0d40656ef1da6367d8a88508b3c13cec0d7af'
        );
        const result = 'af0be2c639224ad37bd2bc7967d6c3303a8a6d4b7813718918a66bde96dc3132';
        params.set('S', ValueType.Bytes, salt);
        params.set('R', ValueType.Int64, new Int64(2));
        return KeyEncryptorKdf.encrypt(key, params).then((res) => {
            expect(ByteUtils.bytesToHex(res)).to.be(result);
        });
    });

    it('throws error for bad aes salt', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Aes));
        params.set('S', ValueType.Bytes, new ArrayBuffer(10));
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad aes salt');
            });
    });

    it('throws error for bad aes rounds', () => {
        const params = new VarDictionary();
        params.set('$UUID', ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Aes));
        params.set('S', ValueType.Bytes, new ArrayBuffer(32));
        params.set('R', ValueType.Int64, new Int64(-1));
        return KeyEncryptorKdf.encrypt(data, params)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('FileCorrupt: bad aes rounds');
            });
    });
});
