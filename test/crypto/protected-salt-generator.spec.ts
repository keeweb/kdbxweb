import expect from 'expect.js';
import { ByteUtils, Consts, ProtectSaltGenerator } from '../../lib';

describe('ProtectSaltGenerator', () => {
    it('generates random sequences with Salsa20', () => {
        return ProtectSaltGenerator.create(
            new Uint8Array([1, 2, 3]),
            Consts.CrsAlgorithm.Salsa20
        ).then((gen) => {
            let bytes = gen.getSalt(0);
            expect(bytes.byteLength).to.be(0);
            bytes = gen.getSalt(10);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('q1l4McuyQYDcDg==');
            bytes = gen.getSalt(10);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('LJTKXBjqlTS8cg==');
            bytes = gen.getSalt(20);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('jKVBKKNUnieRr47Wxh0YTKn82Pw=');
        });
    });

    it('generates random sequences with ChaCha20', () => {
        return ProtectSaltGenerator.create(
            new Uint8Array([1, 2, 3]),
            Consts.CrsAlgorithm.ChaCha20
        ).then((gen) => {
            let bytes = gen.getSalt(0);
            expect(bytes.byteLength).to.be(0);
            bytes = gen.getSalt(10);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('iUIv7m2BJN2ubQ==');
            bytes = gen.getSalt(10);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('BILRgZKxaxbRzg==');
            bytes = gen.getSalt(20);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('KUeBUGjNBYhAoJstSqnMXQwuD6E=');
        });
    });

    it('fails if the algorithm is not supported', () => {
        return ProtectSaltGenerator.create(new Uint8Array(0), 0)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e.message).to.contain('Unsupported: crsAlgorithm');
            });
    });
});
