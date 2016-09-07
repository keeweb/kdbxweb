'use strict';

var expect = require('expect.js'),
    KdbxUuid = require('../../lib/format/kdbx-uuid');

describe('KdbxUuid', function() {
    it('creates uuid from 16 bytes ArrayBuffer', function() {
        var uuid = new KdbxUuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]).buffer);
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates uuid from 16 bytes array', function() {
        var uuid = new KdbxUuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]));
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates uuid base64 string', function() {
        var uuid = new KdbxUuid('AQIDBAUGBwgJCgECAwQFBg==');
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates undefined uuid from less than 16 bytes', function() {
        var uuid = new KdbxUuid(new Uint16Array([123]).buffer);
        expect(uuid.id).to.be(undefined);
    });

    it('creates undefined uuid from falsy', function() {
        var uuid = new KdbxUuid(0);
        expect(uuid.id).to.be(undefined);
    });

    it('returns uuid in toString method', function() {
        var uuid = new KdbxUuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]).buffer);
        expect(uuid.toString()).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('returns uuid in valueOf method', function() {
        var uuid = new KdbxUuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]).buffer);
        expect(uuid.valueOf()).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('allows to be used as hash key', function() {
        var uuid1 = new KdbxUuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]).buffer);
        var uuid2 = new KdbxUuid(new Uint8Array([2,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]).buffer);
        var hashTable = {};
        hashTable[uuid1] = 1;
        hashTable[uuid2] = 2;
        expect(hashTable[uuid1]).to.be(1);
        expect(hashTable[uuid2]).to.be(2);
    });

    it('creates empty uuid from no arg', function() {
        var uuid = new KdbxUuid();
        expect(uuid.toString()).to.be('AAAAAAAAAAAAAAAAAAAAAA==');
        expect(uuid.empty).to.be(true);
    });

    it('sets empty property for empty uuid', function() {
        var uuid = new KdbxUuid(new Uint8Array(16).buffer);
        expect(uuid.toString()).to.be('AAAAAAAAAAAAAAAAAAAAAA==');
        expect(uuid.empty).to.be(true);
    });

    it('returns bytes in toBytes method', function() {
        var bytes = new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]);
        var uuid = new KdbxUuid(bytes.buffer);
        expect(uuid.toBytes()).to.be.eql(bytes);
    });

    it('returns bytes in bytes property', function() {
        var bytes = new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]);
        var uuid = new KdbxUuid(bytes.buffer);
        expect(uuid.bytes).to.be.eql(bytes);
    });

    it('returns bytes in toBytes method for empty value', function() {
        var uuid = new KdbxUuid();
        expect(uuid.toBytes()).to.be.eql([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    });

    it('returns undefined in toBytes method for vad value', function() {
        var bytes = new Uint8Array([1,2,3,4,5]);
        var uuid = new KdbxUuid(bytes.buffer);
        expect(uuid.toBytes()).to.be(undefined);
    });

    it('generates random uuid', function() {
        var uuid = KdbxUuid.random();
        expect(uuid).to.be.a(KdbxUuid);
        expect(uuid.toString()).not.to.be('AAAAAAAAAAAAAAAAAAAAAA==');
    });

    it('checks equality', function() {
        var uuid = new KdbxUuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]).buffer);
        expect(uuid.equals('AQIDBAUGBwgJCgECAwQFBg==')).to.be(true);
        expect(uuid.equals(new KdbxUuid('AQIDBAUGBwgJCgECAwQFBg=='))).to.be(true);
        expect(uuid.equals(null)).to.be(false);
        expect(uuid.equals(undefined)).to.be(false);
        expect(uuid.equals('???')).to.be(false);
        expect(uuid.equals(new KdbxUuid())).to.be(false);
    });
});
