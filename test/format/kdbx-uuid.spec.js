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

    it('creates empty uuid from less than 16 bytes', function() {
        var uuid = new KdbxUuid(new Uint16Array([123]).buffer);
        expect(uuid.id).to.be(undefined);
    });

    it('creates empty uuid from false', function() {
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
});
