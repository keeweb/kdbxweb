import expect from 'expect.js';
import { ByteUtils, Consts, HmacBlockTransform, KdbxError } from '../../lib';

describe('HmacBlockTransform', () => {
    const key = ByteUtils.arrayToBuffer(
        ByteUtils.hexToBytes('1f5c3ef76d43e72ee2c5216c36187c799b153cab3d0cb63a6f3ecccc2627f535')
    );

    it('decrypts and encrypts data', () => {
        const src = new Uint8Array([1, 2, 3, 4, 5]);
        return HmacBlockTransform.encrypt(src.buffer, key).then((enc) => {
            return HmacBlockTransform.decrypt(enc, key).then((dec) => {
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
        return HmacBlockTransform.encrypt(src.buffer, key).then((enc) => {
            return HmacBlockTransform.decrypt(enc, key).then((dec) => {
                expect(ByteUtils.bytesToBase64(dec)).to.be(ByteUtils.bytesToBase64(src));
            });
        });
    });

    it('throws error for invalid hash block', () => {
        const src = new Uint8Array([1, 2, 3, 4, 5]);
        return HmacBlockTransform.encrypt(src.buffer, key).then((enc) => {
            new Uint8Array(enc)[4] = 0;
            return HmacBlockTransform.decrypt(enc, key)
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
