'use strict';

var expect = require('expect.js'),
    ProtectedValue = require('../../lib/crypto/protected-value'),
    ByteUtils = require('../../lib/utils/byte-utils');

describe('ProtectedValue', function() {
    var valueBytes = ByteUtils.stringToBytes('strvalue'),
        encValueBytes = ByteUtils.stringToBytes('strvalue'),
        saltBytes = new Uint8Array(valueBytes.length);
    for (var i = 0; i < saltBytes.length; i++) {
        saltBytes[i] = i;
        encValueBytes[i] ^= i;
    }

    it('decrypts salted value in text property', function() {
        var value = new ProtectedValue(encValueBytes, saltBytes);
        expect(value.text).to.be('strvalue');
    });

    it('returns string in toString', function() {
        var value = new ProtectedValue(encValueBytes, saltBytes);
        expect(value.toString()).to.be('strvalue');
    });

    it('returns string in binary property', function() {
        var value = new ProtectedValue(encValueBytes, saltBytes);
        expect(value.binary).to.be.eql(valueBytes);
    });

    it('checks substring', function() {
        var value = new ProtectedValue(encValueBytes, saltBytes);
        expect(value.includes('test')).to.be(false);
        expect(value.includes('str')).to.be(true);
        expect(value.includes('val')).to.be(true);
        expect(value.includes('value')).to.be(true);
    });
});
