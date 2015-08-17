'use strict';

var expect = require('expect.js'),
    KdbxError = require('../../lib/errors/kdbx-error'),
    Consts = require('../../lib/defs/consts'),
    HashedBlockTransform = require('../../lib/crypto/hashed-block-transform');

describe('HashedBlockTransform', function() {
    it('decrypts and encrypts data', function() {
        var src = new Uint8Array([1,2,3,4,5]);
        var enc = HashedBlockTransform.encrypt(src.buffer);
        var dec = HashedBlockTransform.decrypt(enc);
        dec = new Uint8Array(dec);
        expect(dec).to.be.eql(src);
    });

    it('throws error for invalid hash block', function() {
        expect(function() {
                var src = new Uint8Array([1, 2, 3, 4, 5]);
                var enc = HashedBlockTransform.encrypt(src.buffer);
                new Uint8Array(enc)[4] = 0;
                HashedBlockTransform.decrypt(enc);
            }).to.throwException(function(e) {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            });
    });
});
