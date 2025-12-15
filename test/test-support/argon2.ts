import { Argon2Type, Argon2Version } from '../../lib/crypto/crypto-engine';
import { Bytes } from '../../lib/defs/bytes';

export function argon2(
    password: Bytes,
    salt: Bytes,
    memory: number,
    iterations: number,
    length: number,
    parallelism: number,
    type: Argon2Type,
    version: Argon2Version
): Promise<ArrayBuffer> {
    let Module = require('./argon2-asm.min');
    if (Module.default) {
        Module = Module.default;
    }
    const passwordLen = (password instanceof ArrayBuffer ? password.byteLength : password.byteLength);
    password = Module.allocate(new Uint8Array(password as ArrayBuffer), 'i8', Module.ALLOC_NORMAL);
    const saltLen = salt.byteLength;
    salt = Module.allocate(new Uint8Array(salt as ArrayBuffer), 'i8', Module.ALLOC_NORMAL);
    const hash = <number>Module.allocate(new Array(length), 'i8', Module.ALLOC_NORMAL);
    const encodedLen = 512;
    const encoded = Module.allocate(new Array(encodedLen), 'i8', Module.ALLOC_NORMAL);
    try {
        const res = Module._argon2_hash(
            iterations,
            memory,
            parallelism,
            password,
            passwordLen,
            salt,
            saltLen,
            hash,
            length,
            encoded,
            encodedLen,
            type,
            version
        );
        if (res) {
            return Promise.reject(`Argon2 error: ${res}`);
        }
        const hashArr = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            hashArr[i] = Module.HEAP8[hash + i];
        }
        Module._free(password);
        Module._free(salt);
        Module._free(hash);
    Module._free(encoded);
    // Return an ArrayBuffer with the exact bytes of the Uint8Array view.
    // Use slice on the underlying buffer to copy only the byte range used
    // (handles the case where `hashArr` is a view into a larger ArrayBuffer).
    const resultBuffer = hashArr.buffer.slice(hashArr.byteOffset, hashArr.byteOffset + hashArr.byteLength);
    return Promise.resolve(resultBuffer);
    } catch (e) {
        return Promise.reject(e);
    }
}
