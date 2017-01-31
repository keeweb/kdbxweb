'use strict';

var expect = require('expect.js'),
    Int64 = require('../../lib/utils/int64');

describe('Int64', function() {
    it('creates empty int64', function() {
        var i = new Int64();
        expect(i.hi).to.be(0);
        expect(i.lo).to.be(0);
        expect(i.value).to.be(0);
        expect(i.valueOf()).to.be(0);
    });

    it('creates int64 with low part', function() {
        var i = new Int64(0x123);
        expect(i.hi).to.be(0);
        expect(i.lo).to.be(0x123);
        expect(i.value).to.be(0x123);
        expect(i.valueOf()).to.be(0x123);
    });

    it('creates int64 with low and high parts', function() {
        var i = new Int64(0x123, 0x456);
        expect(i.hi).to.be(0x456);
        expect(i.lo).to.be(0x123);
        expect(i.value).to.be(0x45600000123);
        expect(i.valueOf()).to.be(0x45600000123);
    });

    it('creates int64 with large value', function() {
        var i = Int64.from(0x45600000123);
        expect(i.hi).to.be(0x456);
        expect(i.lo).to.be(0x123);
        expect(i.value).to.be(0x45600000123);
        expect(i.valueOf()).to.be(0x45600000123);
    });

    it('throws error for too high number conversion', function() {
        var i = new Int64(0xffffffff, 0xffffffff);
        expect(function() { i = i.value; }).to.throwException(function(e) {
            expect(e.message).to.be('too large number');
        });
    });

    it('throws error for too high number creation', function() {
        expect(function() { Int64.from(0xffffffffffffff); }).to.throwException(function(e) {
            expect(e.message).to.be('too large number');
        });
    });
});
