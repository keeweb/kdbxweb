export class ChaCha20 {
    private readonly _sigmaWords = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
    private readonly _block = new Uint8Array(64);
    private _blockUsed = 64;
    private readonly _x = new Uint32Array(16);
    private readonly _input: Uint32Array;

    constructor(key: Uint8Array, nonce: Uint8Array) {
        const input = new Uint32Array(16);

        input[0] = this._sigmaWords[0];
        input[1] = this._sigmaWords[1];
        input[2] = this._sigmaWords[2];
        input[3] = this._sigmaWords[3];
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

        this._input = input;
    }

    getBytes(numberOfBytes: number): Uint8Array {
        const out = new Uint8Array(numberOfBytes);
        for (let i = 0; i < numberOfBytes; i++) {
            if (this._blockUsed === 64) {
                this.generateBlock();
                this._blockUsed = 0;
            }
            out[i] = this._block[this._blockUsed];
            this._blockUsed++;
        }
        return out;
    }

    private generateBlock(): void {
        const input = this._input;
        const x = this._x;
        const block = this._block;

        x.set(input);
        for (let i = 20; i > 0; i -= 2) {
            quarterRound(x, 0, 4, 8, 12);
            quarterRound(x, 1, 5, 9, 13);
            quarterRound(x, 2, 6, 10, 14);
            quarterRound(x, 3, 7, 11, 15);
            quarterRound(x, 0, 5, 10, 15);
            quarterRound(x, 1, 6, 11, 12);
            quarterRound(x, 2, 7, 8, 13);
            quarterRound(x, 3, 4, 9, 14);
        }
        for (let i = 16; i--; ) {
            x[i] += input[i];
        }
        for (let i = 16; i--; ) {
            u32to8le(block, 4 * i, x[i]);
        }

        input[12] += 1;
        if (!input[12]) {
            input[13] += 1;
        }
    }

    public encrypt(data: Uint8Array): Uint8Array {
        const length = data.length;
        const res = new Uint8Array(length);
        let pos = 0;
        const block = this._block;
        while (pos < length) {
            this.generateBlock();
            const blockLength = Math.min(length - pos, 64);
            for (let i = 0; i < blockLength; i++) {
                res[pos] = data[pos] ^ block[i];
                pos++;
            }
        }
        return res;
    }
}

function quarterRound(x: Uint32Array, a: number, b: number, c: number, d: number): void {
    x[a] += x[b];
    x[d] = rotate(x[d] ^ x[a], 16);
    x[c] += x[d];
    x[b] = rotate(x[b] ^ x[c], 12);
    x[a] += x[b];
    x[d] = rotate(x[d] ^ x[a], 8);
    x[c] += x[d];
    x[b] = rotate(x[b] ^ x[c], 7);
}

function u8to32le(x: Uint8Array, i: number): number {
    return x[i] | (x[i + 1] << 8) | (x[i + 2] << 16) | (x[i + 3] << 24);
}

function u32to8le(x: Uint8Array, i: number, u: number): void {
    x[i] = u;
    u >>>= 8;
    x[i + 1] = u;
    u >>>= 8;
    x[i + 2] = u;
    u >>>= 8;
    x[i + 3] = u;
}

function rotate(v: number, c: number): number {
    return (v << c) | (v >>> (32 - c));
}
