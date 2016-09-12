'use strict';

function ChaCha20(key, nonce) {
    this.sigmaWords = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
    this.block = new Uint8Array(64);
    this.blockUsed = 64;
    this.x = new Uint32Array(16);

    var input = new Uint32Array(16);

    input[0] = this.sigmaWords[0];
    input[1] = this.sigmaWords[1];
    input[2] = this.sigmaWords[2];
    input[3] = this.sigmaWords[3];
    input[4] = u8to32le(key, 0);
    input[5] = u8to32le(key, 4);
    input[6] = u8to32le(key, 8);
    input[7] = u8to32le(key, 12);
    input[8] = u8to32le(key, 16);
    input[9] = u8to32le(key, 20);
    input[10] = u8to32le(key, 24);
    input[11] = u8to32le(key, 28);
    input[12] = 0; // counter

    if (nonce.length === 12) {
        input[13] = u8to32le(nonce, 0);
        input[14] = u8to32le(nonce, 4);
        input[15] = u8to32le(nonce, 8);
    } else {
        input[13] = 0;
        input[14] = u8to32le(nonce, 0);
        input[15] = u8to32le(nonce, 4);
    }

    this.input = input;
}

ChaCha20.prototype.getBytes = function(numberOfBytes) {
    var out = new Uint8Array(numberOfBytes);
    for (var i = 0; i < numberOfBytes; i++) {
        if (this.blockUsed === 64) {
            this._generateBlock();
            this.blockUsed = 0;
        }
        out[i] = this.block[this.blockUsed];
        this.blockUsed++;
    }
    return out;
};

ChaCha20.prototype._generateBlock = function() {
    var input = this.input;
    var x = this.x;
    var block = this.block;
    var i;

    x.set(input);
    for (i = 20; i > 0; i -= 2) {
        quarterRound(x, 0, 4, 8, 12);
        quarterRound(x, 1, 5, 9, 13);
        quarterRound(x, 2, 6, 10, 14);
        quarterRound(x, 3, 7, 11, 15);
        quarterRound(x, 0, 5, 10, 15);
        quarterRound(x, 1, 6, 11, 12);
        quarterRound(x, 2, 7, 8, 13);
        quarterRound(x, 3, 4, 9, 14);
    }
    for (i = 16; i--;) {
        x[i] += input[i];
    }
    for (i = 16; i--;) {
        u32to8le(block, 4 * i, x[i]);
    }

    input[12] += 1;
    if (!input[12]) {
        input[13] += 1;
    }
};

ChaCha20.prototype.encrypt = function(data) {
    var length = data.length;
    var res = new Uint8Array(length);
    var pos = 0;
    var block = this.block;
    while (pos < length) {
        this._generateBlock();
        var blockLength = Math.min(length - pos, 64);
        for (var i = 0; i < blockLength; i++) {
            res[pos] = data[pos] ^ block[i];
            pos++;
        }
    }
    return res;
};

function quarterRound(x, a, b, c, d) {
    x[a] += x[b];
    x[d] = rotate(x[d] ^ x[a], 16);
    x[c] += x[d];
    x[b] = rotate(x[b] ^ x[c], 12);
    x[a] += x[b];
    x[d] = rotate(x[d] ^ x[a], 8);
    x[c] += x[d];
    x[b] = rotate(x[b] ^ x[c], 7);
}

function u8to32le(x, i) {
    return x[i] | (x[i + 1] << 8) | (x[i + 2] << 16) | (x[i + 3] << 24);
}

function u32to8le(x, i, u) {
    x[i] = u;
    u >>>= 8;
    x[i + 1] = u;
    u >>>= 8;
    x[i + 2] = u;
    u >>>= 8;
    x[i + 3] = u;
}

function rotate(v, c) {
    return (v << c) | (v >>> (32 - c));
}

module.exports = ChaCha20;
