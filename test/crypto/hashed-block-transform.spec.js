'use strict';

var expect = require('expect.js'),
    KdbxError = require('../../lib/errors/kdbx-error'),
    Consts = require('../../lib/defs/consts'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    HashedBlockTransform = require('../../lib/crypto/hashed-block-transform');

describe('HashedBlockTransform', function () {
    it('decrypts and encrypts data', function () {
        var src = new Uint8Array([1, 2, 3, 4, 5]);
        return HashedBlockTransform.encrypt(src.buffer).then(function (enc) {
            return HashedBlockTransform.decrypt(enc).then(function (dec) {
                dec = new Uint8Array(dec);
                expect(dec).to.be.eql(src);
            });
        });
    });

    it('decrypts several blocks', function () {
        var src = new Uint8Array(1024 * 1024 * 2 + 2);
        for (var i = 0; i < src.length; i++) {
            src[i] = i % 256;
        }
        return HashedBlockTransform.encrypt(src.buffer).then(function (enc) {
            return HashedBlockTransform.decrypt(enc).then(function (dec) {
                expect(ByteUtils.bytesToBase64(dec)).to.be(ByteUtils.bytesToBase64(src));
            });
        });
    });

    it('throws error for invalid hash block', function () {
        var src = new Uint8Array([1, 2, 3, 4, 5]);
        return HashedBlockTransform.encrypt(src.buffer).then(function (enc) {
            new Uint8Array(enc)[4] = 0;
            return HashedBlockTransform.decrypt(enc)
                .then(function () {
                    throw 'We should not get here';
                })
                .catch(function (e) {
                    expect(e).to.be.a(KdbxError);
                    expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
                });
        });
    });
});
