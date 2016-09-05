'use strict';

var expect = require('expect.js'),
    KdbxError = require('../../lib/errors/kdbx-error'),
    Consts = require('../../lib/defs/consts'),
    HashedBlockTransform = require('../../lib/crypto/hashed-block-transform');

describe('HashedBlockTransform', function() {
    it('decrypts and encrypts data', function() {
        var src = new Uint8Array([1,2,3,4,5]);
        return HashedBlockTransform.encrypt(src.buffer).then(function(enc) {
            HashedBlockTransform.decrypt(enc).then(function(dec) {
                dec = new Uint8Array(dec);
                expect(dec).to.be.eql(src);
            });
        });
    });

    it('throws error for invalid hash block', function() {
        var src = new Uint8Array([1, 2, 3, 4, 5]);
        return HashedBlockTransform.encrypt(src.buffer).then(function(enc) {
            new Uint8Array(enc)[4] = 0;
            return HashedBlockTransform.decrypt(enc).then(function() {
                throw 'We should not get here';
            }).catch(function(e) {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            });
        });
    });
});
