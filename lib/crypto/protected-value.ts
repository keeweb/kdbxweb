import * as CryptoEngine from './crypto-engine';
import {
    arrayToBuffer,
    base64ToBytes,
    bytesToBase64,
    bytesToString,
    stringToBytes,
    zeroBuffer
} from '../utils/byte-utils';

export class ProtectedValue {
    readonly value: Uint8Array;
    readonly salt: Uint8Array;

    constructor(value: ArrayBuffer, salt: ArrayBuffer) {
        this.value = new Uint8Array(value);
        this.salt = new Uint8Array(salt);
    }

    toString(): string {
        return bytesToBase64(this.value);
    }

    static fromString(str: string): ProtectedValue {
        const bytes = stringToBytes(str),
            salt = CryptoEngine.random(bytes.length);
        for (let i = 0, len = bytes.length; i < len; i++) {
            bytes[i] ^= salt[i];
        }
        return new ProtectedValue(arrayToBuffer(bytes), arrayToBuffer(salt));
    }

    toBase64(): string {
        const binary = this.getBinary();
        const base64 = bytesToBase64(binary);
        zeroBuffer(binary);
        return base64;
    }

    static fromBase64(base64: string): ProtectedValue {
        const bytes = base64ToBytes(base64);
        return ProtectedValue.fromBinary(bytes);
    }

    /**
     * Keep in mind that you're passing the ownership of this array, the contents will be destroyed
     */
    static fromBinary(binary: ArrayBuffer): ProtectedValue {
        const bytes = new Uint8Array(binary),
            salt = CryptoEngine.random(bytes.length);
        for (let i = 0, len = bytes.length; i < len; i++) {
            bytes[i] ^= salt[i];
        }
        return new ProtectedValue(arrayToBuffer(bytes), arrayToBuffer(salt));
    }

    includes(str: string): boolean {
        if (str.length === 0) {
            return false;
        }
        const source = this.value,
            salt = this.salt,
            search = stringToBytes(str),
            sourceLen = source.length,
            searchLen = search.length,
            maxPos = sourceLen - searchLen;
        src: for (let sourceIx = 0; sourceIx <= maxPos; sourceIx++) {
            for (let searchIx = 0; searchIx < searchLen; searchIx++) {
                if (
                    (source[sourceIx + searchIx] ^ salt[sourceIx + searchIx]) !==
                    search[searchIx]
                ) {
                    continue src;
                }
            }
            return true;
        }
        return false;
    }

    getHash(): Promise<ArrayBuffer> {
        const binary = arrayToBuffer(this.getBinary());
        return CryptoEngine.sha256(binary).then((hash) => {
            zeroBuffer(binary);
            return hash;
        });
    }

    getText(): string {
        return bytesToString(this.getBinary());
    }

    getBinary(): Uint8Array {
        const value = this.value,
            salt = this.salt;
        const bytes = new Uint8Array(value.byteLength);
        for (let i = bytes.length - 1; i >= 0; i--) {
            bytes[i] = value[i] ^ salt[i];
        }
        return bytes;
    }

    setSalt(newSalt: ArrayBuffer): void {
        const newSaltArr = new Uint8Array(newSalt);
        const value = this.value,
            salt = this.salt;
        for (let i = 0, len = value.length; i < len; i++) {
            value[i] = value[i] ^ salt[i] ^ newSaltArr[i];
            salt[i] = newSaltArr[i];
        }
    }

    clone(): ProtectedValue {
        return new ProtectedValue(this.value, this.salt);
    }

    get byteLength(): number {
        return this.value.byteLength;
    }
}
