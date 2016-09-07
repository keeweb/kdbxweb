'use strict';

var expect = require('expect.js'),
    Salsa20 = require('../../lib/crypto/salsa20');

describe('Salsa20', function() {
    it('transforms data', function () {
        var key = [0x80];
        var nonce = [];
        var i;

        for (i = 1; i < 32; i++) {
            key[i] = 0;
        }
        for (i = 0; i < 8; i++) {
            nonce[i] = 0;
        }

        var good = [
            // 0..63
            'e3be8fdd8beca2e3ea8ef9475b29a6e7' +
            '003951e1097a5c38d23b7a5fad9f6844' +
            'b22c97559e2723c7cbbd3fe4fc8d9a07' +
            '44652a83e72a9c461876af4d7ef1a117',
            // 192..255
            '57be81f47b17d9ae7c4ff15429a73e10' +
            'acf250ed3a90a93c711308a74c6216a9' +
            'ed84cd126da7f28e8abf8bb63517e1ca' +
            '98e712f4fb2e1a6aed9fdc73291faa17',
            // 256..319
            '958211c4ba2ebd5838c635edb81f513a' +
            '91a294e194f1c039aeec657dce40aa7e' +
            '7c0af57cacefa40c9f14b71a4b3456a6' +
            '3e162ec7d8d10b8ffb1810d71001b618',
            // 448..511
            '696afcfd0cddcc83c7e77f11a649d79a' +
            'cdc3354e9635ff137e929933a0bd6f53' +
            '77efa105a3a4266b7c0d089d08f1e855' +
            'cc32b15b93784a36e56a76cc64bc8477',

            '028184aa3d60ee85d13e2f398e7569ec' +
            'fccba6995436ab8891d5c20b6f3bca36' +
            'edcea801715a729a4afe751d1d8fe069' +
            'c24e8cfa16c4eb14f37f70ae923c0cb5'
        ];

        var state = new Salsa20(key, nonce);
        expect(state.getHexString(64)).to.be(good[0]);
        state.getBytes(128);
        expect(state.getHexString(64)).to.be(good[1]);
        expect(state.getHexString(64)).to.be(good[2]);
        state.getBytes(128);
        expect(state.getHexString(64)).to.be(good[3]);
        state.counterWords[0] = -1;
        state.getBytes(128);
        expect(state.getHexString(64)).to.be(good[4]);
    });
});
