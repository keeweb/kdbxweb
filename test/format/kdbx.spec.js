'use strict';

var expect = require('expect.js'),
    kdbxweb = require('../../lib/index'),
    TestResources = require('../test-support/test-resources');

describe('Kdbx', function () {
    it('should load simple file', function () {
        var db = kdbxweb.Kdbx.load(TestResources.sample, 'demo');
        expect(db).to.be.a(kdbxweb.Kdbx);
    });

    it('generates error for bad arguments', function () {
        expect(function() {
            kdbxweb.Kdbx.load('file', 'badpass');
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('data');
            });
        expect(function() {
            kdbxweb.Kdbx.load(new ArrayBuffer(0), new ArrayBuffer(123));
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('password');
            });
        expect(function() {
            kdbxweb.Kdbx.load(new ArrayBuffer(0), 'pass', 'keyfile');
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('keyFile');
            });
    });

    it('generates error for bad password', function () {
        expect(function() {
            kdbxweb.Kdbx.load(TestResources.sample, 'badpass');
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
    });
});
