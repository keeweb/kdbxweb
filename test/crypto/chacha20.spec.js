'use strict';

var expect = require('expect.js'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    ChaCha20 = require('../../lib/crypto/chacha20');

describe('ChaCha20', function() {
    it('transforms data', function () {
        var key = new Uint8Array(32);
        var nonce = new Uint8Array(32);

        var chacha20 = new ChaCha20(key, nonce);
        expect(ByteUtils.bytesToHex(chacha20.getBytes(32))).to.be('76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7');
        expect(ByteUtils.bytesToHex(chacha20.getBytes(32))).to.be('da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586');
        chacha20.input[12] = 0xffffffff;
        expect(ByteUtils.bytesToHex(chacha20.getBytes(16))).to.be('ace4cd09e294d1912d4ad205d06f95d9');
    });
});
