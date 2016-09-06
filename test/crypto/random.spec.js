'use strict';

var expect = require('expect.js'),
    Random = require('../../lib/crypto/random');

describe('Random', function() {
    it('generates random sequences', function() {
        testRandom();
    });

    function testRandom() {
        var bytes = Random.getBytes(0);
        expect(bytes.length).to.be(0);
        bytes = Random.getBytes(10);
        expect(bytes.length).to.be(10);
        var bytes2 = Random.getBytes(10);
        expect(bytes2.length).to.be(10);
        expect(bytes).not.to.be.eql(bytes2);
        bytes = Random.getBytes(128);
        expect(bytes.length).to.be(128);
    }
});
