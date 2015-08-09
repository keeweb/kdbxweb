'use strict';

var expect = require('expect.js'),
    Uuid = require('../../lib/format/uuid');

describe('Uuid', function() {
    it('creates uuid from 16 bytes ArrayBuffer', function() {
        var uuid = new Uuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]).buffer);
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates uuid from 16 bytes array', function() {
        var uuid = new Uuid(new Uint8Array([1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6]));
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates empty uuid from less than 16 bytes', function() {
        var uuid = new Uuid(new Uint16Array([123]).buffer);
        expect(uuid.id).to.be(undefined);
    });

    it('creates empty uuid from false', function() {
        var uuid = new Uuid(0);
        expect(uuid.id).to.be(undefined);
    });
});
