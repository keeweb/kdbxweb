'use strict';

var expect = require('expect.js'),
    kdbxweb = require('../../lib/index'),
    TestResources = require('../test-support/test-resources');

describe('Kdbx', function () {
    it('should load simple file', function () {
        var db = kdbxweb.Kdbx.load(TestResources.sample,
            new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo')));
        expect(db).to.be.a(kdbxweb.Kdbx);
    });

    it('generates error for bad arguments', function () {
        expect(function() {
            kdbxweb.Kdbx.load('file');
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('data');
            });
        expect(function() {
            kdbxweb.Kdbx.load(new ArrayBuffer(0), '123');
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
        expect(function() {
            kdbxweb.Kdbx.load(new ArrayBuffer(0), null);
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for bad password', function () {
        expect(function() {
            kdbxweb.Kdbx.load(TestResources.sample,
                new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('badpass')));
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
    });
});
