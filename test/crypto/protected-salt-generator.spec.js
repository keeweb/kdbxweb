'use strict';

var expect = require('expect.js'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    Consts = require('../../lib/defs/consts'),
    ProtectedSaltGenerator = require('../../lib/crypto/protect-salt-generator');

describe('ProtectedSaltGenerator', function() {
    it('generates random sequences with Salsa20', function() {
        return ProtectedSaltGenerator.create(new Uint8Array([1,2,3]), Consts.CrsAlgorithm.Salsa20).then(function(gen) {
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

    it('generates random sequences with ChaCha20', function() {
        return ProtectedSaltGenerator.create(new Uint8Array([1,2,3]), Consts.CrsAlgorithm.ChaCha20).then(function(gen) {
            var bytes = gen.getSalt(0);
            expect(bytes.byteLength).to.be(0);
            bytes = gen.getSalt(10);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('iUIv7m2BJN2ubQ==');
            bytes = gen.getSalt(10);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('BILRgZKxaxbRzg==');
            bytes = gen.getSalt(20);
            expect(ByteUtils.bytesToBase64(bytes)).to.be('KUeBUGjNBYhAoJstSqnMXQwuD6E=');
        });
    });

    it('fails if the algorithm is not supported', function() {
        return ProtectedSaltGenerator.create(0).then(function() { throw 'Not expected'; })
            .catch(function(e) {
                expect(e.message).to.contain('Unsupported: crsAlgorithm');
            });
    });
});
