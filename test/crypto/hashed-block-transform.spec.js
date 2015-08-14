'use strict';

var expect = require('expect.js'),
    HashedBlockTransform = require('../../lib/crypto/hashed-block-transform');

describe('HashedBlockTransform', function() {
    it('decrypts and encrypts data', function() {
        var src = new Uint8Array([1,2,3,4,5]);
        var enc = HashedBlockTransform.encrypt(src.buffer);
        var dec = HashedBlockTransform.decrypt(enc);
        dec = new Uint8Array(dec);
        expect(dec).to.be.eql(src);
    });
});
