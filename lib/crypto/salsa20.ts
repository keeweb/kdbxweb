// code from this gist: https://gist.github.com/dchest/4582374 (no license declared)

export class Salsa20 {
    private readonly _rounds = 20;
    private readonly _sigmaWords = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

    // State
    private readonly _keyWords: number[] = []; // key words
    private readonly _nonceWords = [0, 0]; // nonce words
    private readonly _counterWords = [0, 0]; // block counter words

    // Output buffer
    private readonly _block = new Uint8Array(64); // output block of 64 bytes
    private _blockUsed = 64; // number of block bytes used

    constructor(key: Uint8Array, nonce: Uint8Array) {
        this.setKey(key);
        this.setNonce(nonce);
    }

    // setKey sets the key to the given 32-byte array.
    private setKey(key: Uint8Array): void {
        for (let i = 0, j = 0; i < 8; i++, j += 4) {
            this._keyWords[i] =
                (key[j] & 0xff) |
                ((key[j + 1] & 0xff) << 8) |
                ((key[j + 2] & 0xff) << 16) |
                ((key[j + 3] & 0xff) << 24);
        }
        this.reset();
    }

    // setNonce sets the nonce to the given 8-byte array.
    private setNonce(nonce: Uint8Array): void {
        this._nonceWords[0] =
            (nonce[0] & 0xff) |
            ((nonce[1] & 0xff) << 8) |
            ((nonce[2] & 0xff) << 16) |
            ((nonce[3] & 0xff) << 24);
        this._nonceWords[1] =
            (nonce[4] & 0xff) |
            ((nonce[5] & 0xff) << 8) |
            ((nonce[6] & 0xff) << 16) |
            ((nonce[7] & 0xff) << 24);
        this.reset();
    }

    // getBytes returns the next numberOfBytes bytes of stream.
    getBytes(numberOfBytes: number): Uint8Array {
        const out = new Uint8Array(numberOfBytes);
        for (let i = 0; i < numberOfBytes; i++) {
            if (this._blockUsed === 64) {
                this.generateBlock();
                this.incrementCounter();
                this._blockUsed = 0;
            }
            out[i] = this._block[this._blockUsed];
            this._blockUsed++;
        }
        return out;
    }

    getHexString(numberOfBytes: number): string {
        const hex = [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'a',
            'b',
            'c',
            'd',
            'e',
            'f'
        ];
        const out = [];
        const bytes = this.getBytes(numberOfBytes);
        for (let i = 0; i < bytes.length; i++) {
            out.push(hex[(bytes[i] >> 4) & 15]);
            out.push(hex[bytes[i] & 15]);
        }
        return out.join('');
    }

    private reset() {
        this._counterWords[0] = 0;
        this._counterWords[1] = 0;
        this._blockUsed = 64;
    }

    private incrementCounter() {
        // Note: maximum 2^64 blocks.
        this._counterWords[0] = (this._counterWords[0] + 1) & 0xffffffff;
        if (this._counterWords[0] === 0) {
            this._counterWords[1] = (this._counterWords[1] + 1) & 0xffffffff;
        }
    }

    // _generateBlock generates 64 bytes from key, nonce, and counter,
    // and puts the result into this.block.
    private generateBlock() {
        const j0 = this._sigmaWords[0],
            j1 = this._keyWords[0],
            j2 = this._keyWords[1],
            j3 = this._keyWords[2],
            j4 = this._keyWords[3],
            j5 = this._sigmaWords[1],
            j6 = this._nonceWords[0],
            j7 = this._nonceWords[1],
            j8 = this._counterWords[0],
            j9 = this._counterWords[1],
            j10 = this._sigmaWords[2],
            j11 = this._keyWords[4],
            j12 = this._keyWords[5],
            j13 = this._keyWords[6],
            j14 = this._keyWords[7],
            j15 = this._sigmaWords[3];

        let x0 = j0,
            x1 = j1,
            x2 = j2,
            x3 = j3,
            x4 = j4,
            x5 = j5,
            x6 = j6,
            x7 = j7,
            x8 = j8,
            x9 = j9,
            x10 = j10,
            x11 = j11,
            x12 = j12,
            x13 = j13,
            x14 = j14,
            x15 = j15;

        let u: number;

        for (let i = 0; i < this._rounds; i += 2) {
            u = x0 + x12;
            x4 ^= (u << 7) | (u >>> (32 - 7));
            u = x4 + x0;
            x8 ^= (u << 9) | (u >>> (32 - 9));
            u = x8 + x4;
            x12 ^= (u << 13) | (u >>> (32 - 13));
            u = x12 + x8;
            x0 ^= (u << 18) | (u >>> (32 - 18));

            u = x5 + x1;
            x9 ^= (u << 7) | (u >>> (32 - 7));
            u = x9 + x5;
            x13 ^= (u << 9) | (u >>> (32 - 9));
            u = x13 + x9;
            x1 ^= (u << 13) | (u >>> (32 - 13));
            u = x1 + x13;
            x5 ^= (u << 18) | (u >>> (32 - 18));

            u = x10 + x6;
            x14 ^= (u << 7) | (u >>> (32 - 7));
            u = x14 + x10;
            x2 ^= (u << 9) | (u >>> (32 - 9));
            u = x2 + x14;
            x6 ^= (u << 13) | (u >>> (32 - 13));
            u = x6 + x2;
            x10 ^= (u << 18) | (u >>> (32 - 18));

            u = x15 + x11;
            x3 ^= (u << 7) | (u >>> (32 - 7));
            u = x3 + x15;
            x7 ^= (u << 9) | (u >>> (32 - 9));
            u = x7 + x3;
            x11 ^= (u << 13) | (u >>> (32 - 13));
            u = x11 + x7;
            x15 ^= (u << 18) | (u >>> (32 - 18));

            u = x0 + x3;
            x1 ^= (u << 7) | (u >>> (32 - 7));
            u = x1 + x0;
            x2 ^= (u << 9) | (u >>> (32 - 9));
            u = x2 + x1;
            x3 ^= (u << 13) | (u >>> (32 - 13));
            u = x3 + x2;
            x0 ^= (u << 18) | (u >>> (32 - 18));

            u = x5 + x4;
            x6 ^= (u << 7) | (u >>> (32 - 7));
            u = x6 + x5;
            x7 ^= (u << 9) | (u >>> (32 - 9));
            u = x7 + x6;
            x4 ^= (u << 13) | (u >>> (32 - 13));
            u = x4 + x7;
            x5 ^= (u << 18) | (u >>> (32 - 18));

            u = x10 + x9;
            x11 ^= (u << 7) | (u >>> (32 - 7));
            u = x11 + x10;
            x8 ^= (u << 9) | (u >>> (32 - 9));
            u = x8 + x11;
            x9 ^= (u << 13) | (u >>> (32 - 13));
            u = x9 + x8;
            x10 ^= (u << 18) | (u >>> (32 - 18));

            u = x15 + x14;
            x12 ^= (u << 7) | (u >>> (32 - 7));
            u = x12 + x15;
            x13 ^= (u << 9) | (u >>> (32 - 9));
            u = x13 + x12;
            x14 ^= (u << 13) | (u >>> (32 - 13));
            u = x14 + x13;
            x15 ^= (u << 18) | (u >>> (32 - 18));
        }

        x0 += j0;
        x1 += j1;
        x2 += j2;
        x3 += j3;
        x4 += j4;
        x5 += j5;
        x6 += j6;
        x7 += j7;
        x8 += j8;
        x9 += j9;
        x10 += j10;
        x11 += j11;
        x12 += j12;
        x13 += j13;
        x14 += j14;
        x15 += j15;

        this._block[0] = (x0 >>> 0) & 0xff;
        this._block[1] = (x0 >>> 8) & 0xff;
        this._block[2] = (x0 >>> 16) & 0xff;
        this._block[3] = (x0 >>> 24) & 0xff;
        this._block[4] = (x1 >>> 0) & 0xff;
        this._block[5] = (x1 >>> 8) & 0xff;
        this._block[6] = (x1 >>> 16) & 0xff;
        this._block[7] = (x1 >>> 24) & 0xff;
        this._block[8] = (x2 >>> 0) & 0xff;
        this._block[9] = (x2 >>> 8) & 0xff;
        this._block[10] = (x2 >>> 16) & 0xff;
        this._block[11] = (x2 >>> 24) & 0xff;
        this._block[12] = (x3 >>> 0) & 0xff;
        this._block[13] = (x3 >>> 8) & 0xff;
        this._block[14] = (x3 >>> 16) & 0xff;
        this._block[15] = (x3 >>> 24) & 0xff;
        this._block[16] = (x4 >>> 0) & 0xff;
        this._block[17] = (x4 >>> 8) & 0xff;
        this._block[18] = (x4 >>> 16) & 0xff;
        this._block[19] = (x4 >>> 24) & 0xff;
        this._block[20] = (x5 >>> 0) & 0xff;
        this._block[21] = (x5 >>> 8) & 0xff;
        this._block[22] = (x5 >>> 16) & 0xff;
        this._block[23] = (x5 >>> 24) & 0xff;
        this._block[24] = (x6 >>> 0) & 0xff;
        this._block[25] = (x6 >>> 8) & 0xff;
        this._block[26] = (x6 >>> 16) & 0xff;
        this._block[27] = (x6 >>> 24) & 0xff;
        this._block[28] = (x7 >>> 0) & 0xff;
        this._block[29] = (x7 >>> 8) & 0xff;
        this._block[30] = (x7 >>> 16) & 0xff;
        this._block[31] = (x7 >>> 24) & 0xff;
        this._block[32] = (x8 >>> 0) & 0xff;
        this._block[33] = (x8 >>> 8) & 0xff;
        this._block[34] = (x8 >>> 16) & 0xff;
        this._block[35] = (x8 >>> 24) & 0xff;
        this._block[36] = (x9 >>> 0) & 0xff;
        this._block[37] = (x9 >>> 8) & 0xff;
        this._block[38] = (x9 >>> 16) & 0xff;
        this._block[39] = (x9 >>> 24) & 0xff;
        this._block[40] = (x10 >>> 0) & 0xff;
        this._block[41] = (x10 >>> 8) & 0xff;
        this._block[42] = (x10 >>> 16) & 0xff;
        this._block[43] = (x10 >>> 24) & 0xff;
        this._block[44] = (x11 >>> 0) & 0xff;
        this._block[45] = (x11 >>> 8) & 0xff;
        this._block[46] = (x11 >>> 16) & 0xff;
        this._block[47] = (x11 >>> 24) & 0xff;
        this._block[48] = (x12 >>> 0) & 0xff;
        this._block[49] = (x12 >>> 8) & 0xff;
        this._block[50] = (x12 >>> 16) & 0xff;
        this._block[51] = (x12 >>> 24) & 0xff;
        this._block[52] = (x13 >>> 0) & 0xff;
        this._block[53] = (x13 >>> 8) & 0xff;
        this._block[54] = (x13 >>> 16) & 0xff;
        this._block[55] = (x13 >>> 24) & 0xff;
        this._block[56] = (x14 >>> 0) & 0xff;
        this._block[57] = (x14 >>> 8) & 0xff;
        this._block[58] = (x14 >>> 16) & 0xff;
        this._block[59] = (x14 >>> 24) & 0xff;
        this._block[60] = (x15 >>> 0) & 0xff;
        this._block[61] = (x15 >>> 8) & 0xff;
        this._block[62] = (x15 >>> 16) & 0xff;
        this._block[63] = (x15 >>> 24) & 0xff;
    }
}
