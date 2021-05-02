import expect from 'expect.js';
import { ByteUtils, Consts, HashedBlockTransform, KdbxError } from '../../lib';

describe('HashedBlockTransform', () => {
    it('decrypts and encrypts data', () => {
        const src = new Uint8Array([1, 2, 3, 4, 5]);
        return HashedBlockTransform.encrypt(src.buffer).then((enc) => {
            return HashedBlockTransform.decrypt(enc).then((dec) => {
                dec = new Uint8Array(dec);
                expect(dec).to.be.eql(src);
            });
        });
    });

    it('decrypts several blocks', () => {
        const src = new Uint8Array(1024 * 1024 * 2 + 2);
        for (let i = 0; i < src.length; i++) {
            src[i] = i % 256;
        }
        return HashedBlockTransform.encrypt(src.buffer).then((enc) => {
            return HashedBlockTransform.decrypt(enc).then((dec) => {
                expect(ByteUtils.bytesToBase64(dec)).to.be(ByteUtils.bytesToBase64(src));
            });
        });
    });

    it('throws error for invalid hash block', () => {
        const src = new Uint8Array([1, 2, 3, 4, 5]);
        return HashedBlockTransform.encrypt(src.buffer).then((enc) => {
            new Uint8Array(enc)[4] = 0;
            return HashedBlockTransform.decrypt(enc)
                .then(() => {
                    throw 'We should not get here';
                })
                .catch((e) => {
                    expect(e).to.be.a(KdbxError);
                    expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
                });
        });
    });
});
