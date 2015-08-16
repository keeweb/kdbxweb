'use strict';

var expect = require('expect.js'),
    kdbxweb = require('../../lib/index'),
    TestResources = require('../test-support/test-resources');

describe('Kdbx', function () {
    it('should load simple file', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        var db = kdbxweb.Kdbx.load(TestResources.demoKdbx, cred);
        expect(db).to.be.a(kdbxweb.Kdbx);
    });

    it('should load utf8 uncompressed file', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('пароль'));
        var db = kdbxweb.Kdbx.load(TestResources.cyrillicKdbx, cred);
        expect(db).to.be.a(kdbxweb.Kdbx);
    });

    it('should successfully load saved file', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        var db = kdbxweb.Kdbx.load(TestResources.demoKdbx, cred);
        expect(db).to.be.a(kdbxweb.Kdbx);
        var ab = db.save();
        kdbxweb.Kdbx.load(ab, cred);
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
            kdbxweb.Kdbx.load(TestResources.demoKdbx,
                new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('badpass')));
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
    });
});
