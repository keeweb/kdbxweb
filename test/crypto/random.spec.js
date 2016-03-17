'use strict';

require('../test-support/crypto-mock-node');

var expect = require('expect.js'),
    Random = require('../../lib/crypto/random');

describe('Random', function() {
    it('generates random sequences', function() {
        testRandom();
    });

    it('default implementation is working', function() {
        testRandom();
    });

    if (global.crypto) {
        it('can work without built-in getRandomValues', function () {
            var oldGetRandomValues = global.crypto.getRandomValues;
            global.crypto.getRandomValues = null;
            testRandom();
            global.crypto.getRandomValues = oldGetRandomValues;
        });

        it('can work with node.js randomBytes', function () {
            var oldGetRandomValues = global.crypto.getRandomValues;
            var oldRandomBytes = global.crypto.randomBytes;
            global.crypto.getRandomValues = null;
            global.crypto.randomBytes = function (len) { return new Uint8Array(len).buffer; };
            testRandom();
            global.crypto.getRandomValues = oldGetRandomValues;
            global.crypto.randomBytes = oldRandomBytes;
        });
    }

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
