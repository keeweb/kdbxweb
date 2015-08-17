'use strict';

var expect = require('expect.js'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    ProtectedSaltGenerator = require('../../lib/crypto/protect-salt-generator');

describe('Random', function() {
    it('generates random sequences', function() {
        var gen = new ProtectedSaltGenerator(new Uint8Array([1,2,3]));
        var bytes = gen.getSalt(0);
        expect(bytes.byteLength).to.be(0);
        bytes = gen.getSalt(10);
        expect(ByteUtils.bytesToBase64(bytes)).to.be('q1l4McuyQYDcDg==');
        bytes = gen.getSalt(10);
        expect(ByteUtils.bytesToBase64(bytes)).to.be('LJTKXBjqlTS8cg==');
        bytes = gen.getSalt(20);
        expect(ByteUtils.bytesToBase64(bytes)).to.be('jKVBKKNUnieRr47Wxh0YTKn82Pw=');
    });
});
