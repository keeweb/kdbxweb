import expect from 'expect.js';
import { ByteUtils } from '../../lib';

describe('ByteUtils', () => {
    describe('arrayBufferEquals', () => {
        it('returns true for equal ArrayBuffers', () => {
            const ab1 = new Int8Array([1, 2, 3]).buffer;
            const ab2 = new Int8Array([1, 2, 3]).buffer;
            expect(ByteUtils.arrayBufferEquals(ab1, ab2)).to.be(true);
        });

        it('returns false for ArrayBuffers of different length', () => {
            const ab1 = new Int8Array([1, 2, 3]).buffer;
            const ab2 = new Int8Array([1, 2, 3, 4]).buffer;
            expect(ByteUtils.arrayBufferEquals(ab1, ab2)).to.be(false);
        });

        it('returns false for different ArrayBuffers', () => {
            const ab1 = new Int8Array([1, 2, 3]).buffer;
            const ab2 = new Int8Array([3, 2, 1]).buffer;
            expect(ByteUtils.arrayBufferEquals(ab1, ab2)).to.be(false);
        });
    });

    const str = 'utf8стрƒΩ≈ç√∫˜µ≤æ∆©ƒ∂ß';
    const strBytes = new Uint8Array([
        117,
        116,
        102,
        56,
        209,
        129,
        209,
        130,
        209,
        128,
        198,
        146,
        206,
        169,
        226,
        137,
        136,
        195,
        167,
        226,
        136,
        154,
        226,
        136,
        171,
        203,
        156,
        194,
        181,
        226,
        137,
        164,
        195,
        166,
        226,
        136,
        134,
        194,
        169,
        198,
        146,
        226,
        136,
        130,
        195,
        159
    ]);

    describe('bytesToString', () => {
        it('converts Array to string', () => {
            expect(ByteUtils.bytesToString(strBytes)).to.be(str);
        });

        it('converts ArrayBuffer to string', () => {
            expect(ByteUtils.bytesToString(strBytes.buffer)).to.be(str);
        });
    });

    describe('stringToBytes', () => {
        it('converts string to Array', () => {
            expect(ByteUtils.stringToBytes(str)).to.be.eql(strBytes);
        });
    });

    const base64 = 'c3Ry0L/RgNC40LLQtdGC';
    const bytes = new Uint8Array([
        115,
        116,
        114,
        208,
        191,
        209,
        128,
        208,
        184,
        208,
        178,
        208,
        181,
        209,
        130
    ]);

    describe('base64ToBytes', () => {
        it('converts base64-string to byte array', () => {
            expect(ByteUtils.base64ToBytes(base64)).to.be.eql(bytes);
        });

        it('converts base64-string to byte array using atob', () => {
            const Buffer = global.Buffer;
            // @ts-ignore
            global.Buffer = undefined;
            try {
                expect(ByteUtils.base64ToBytes(base64)).to.be.eql(bytes);
            } finally {
                global.Buffer = Buffer;
            }
        });
    });

    describe('bytesToBase64', () => {
        it('converts byte array to base64-string', () => {
            expect(ByteUtils.bytesToBase64(bytes)).to.be.eql(base64);
        });

        it('converts ArrayBuffer base64-string', () => {
            expect(ByteUtils.bytesToBase64(bytes.buffer)).to.be.eql(base64);
        });

        it('converts byte array to base64-string using btoa', () => {
            const Buffer = global.Buffer;
            // @ts-ignore
            global.Buffer = undefined;
            try {
                expect(ByteUtils.bytesToBase64(bytes)).to.be.eql(base64);
            } finally {
                global.Buffer = Buffer;
            }
        });
    });

    const hexString = '737472d0bfd180d0b8d0b2d0b5d101';
    const hexBytes = new Uint8Array([
        115,
        116,
        114,
        208,
        191,
        209,
        128,
        208,
        184,
        208,
        178,
        208,
        181,
        209,
        1
    ]);

    describe('hexToBytes', () => {
        it('converts hex string to byte array', () => {
            expect(ByteUtils.hexToBytes(hexString)).to.be.eql(hexBytes);
        });

        it('converts hex string in uppercase to byte array', () => {
            expect(ByteUtils.hexToBytes(hexString.toUpperCase())).to.be.eql(hexBytes);
        });
    });

    describe('bytesToHex', () => {
        it('converts byte array to hex string', () => {
            expect(ByteUtils.bytesToHex(hexBytes)).to.be.eql(hexString);
        });

        it('converts ArrayBuffer to hex string', () => {
            expect(ByteUtils.bytesToHex(hexBytes.buffer)).to.be.eql(hexString);
        });
    });

    describe('zeroBuffer', () => {
        it('fills array with zeroes', () => {
            const arr = new Uint8Array([1, 2, 3]);
            ByteUtils.zeroBuffer(arr);
            expect(arr).to.be.eql([0, 0, 0]);
        });

        it('fills array buffer with zeroes', () => {
            const arr = new Uint8Array([1, 2, 3]);
            ByteUtils.zeroBuffer(arr.buffer);
            expect(arr).to.be.eql([0, 0, 0]);
        });
    });

    describe('arrayToBuffer', () => {
        it('converts array to buffer', () => {
            const ab = ByteUtils.arrayToBuffer(new Uint8Array(4));
            expect(ab).to.be.an(ArrayBuffer);
            expect(ab.byteLength).to.be(4);
        });

        it('converts buffer to buffer', () => {
            const ab = ByteUtils.arrayToBuffer(new Uint8Array(4).buffer);
            expect(ab).to.be.an(ArrayBuffer);
            expect(ab.byteLength).to.be(4);
        });

        it('makes sliced buffer from sliced array', () => {
            const srcAb = new ArrayBuffer(10);
            const arr = new Uint8Array(srcAb, 1, 4);
            arr[0] = 1;
            expect(arr.buffer.byteLength).to.be(10);
            const ab = ByteUtils.arrayToBuffer(arr);
            expect(ab).to.be.an(ArrayBuffer);
            expect(ab.byteLength).to.be(4);
            expect(new Uint8Array(ab)[0]).to.be(1);
        });
    });
});
