'use strict';

var expect = require('expect.js'),
    KdbxError = require('../../lib/errors/kdbx-error'),
    Consts = require('../../lib/defs/consts'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    HmacBlockTransform = require('../../lib/crypto/hmac-block-transform');

describe('HmacBlockTransform', function() {
    var key = ByteUtils.arrayToBuffer(ByteUtils.hexToBytes('1f5c3ef76d43e72ee2c5216c36187c799b153cab3d0cb63a6f3ecccc2627f535'));

    it('decrypts and encrypts data', function() {
        var src = new Uint8Array([1,2,3,4,5]);
        return HmacBlockTransform.encrypt(src.buffer, key).then(function(enc) {
            return HmacBlockTransform.decrypt(enc, key).then(function(dec) {
                dec = new Uint8Array(dec);
                expect(dec).to.be.eql(src);
            });
        });
    });

    it('decrypts several blocks', function() {
        var src = new Uint8Array(1024*1024*2 + 2);
        for (var i = 0; i < src.length; i++) {
            src[i] = i % 256;
        }
        return HmacBlockTransform.encrypt(src.buffer, key).then(function(enc) {
            return HmacBlockTransform.decrypt(enc, key).then(function(dec) {
                expect(ByteUtils.bytesToBase64(dec)).to.be(ByteUtils.bytesToBase64(src));
            });
        });
    });

    it('throws error for invalid hash block', function() {
        var src = new Uint8Array([1, 2, 3, 4, 5]);
        return HmacBlockTransform.encrypt(src.buffer, key).then(function(enc) {
            new Uint8Array(enc)[4] = 0;
            return HmacBlockTransform.decrypt(enc, key).then(function() {
                throw 'We should not get here';
            }).catch(function(e) {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            });
        });
    });
});
