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
});
