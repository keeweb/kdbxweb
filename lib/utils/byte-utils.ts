import { Bytes } from '../defs/bytes';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function arrayBufferEquals(ab1: Bytes | ArrayBuffer, ab2: Bytes | ArrayBuffer): boolean {
    const a1 = ab1 instanceof ArrayBuffer ? new Uint8Array(ab1) : (ab1 as Uint8Array);
    const a2 = ab2 instanceof ArrayBuffer ? new Uint8Array(ab2) : (ab2 as Uint8Array);
    if (a1.byteLength !== a2.byteLength) {
        return false;
    }
    for (let i = 0, len = a1.length; i < len; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}

export function bytesToString(arr: Bytes): string {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    return textDecoder.decode(arr);
}

export function stringToBytes(str: string): Uint8Array {
    return textEncoder.encode(str);
}

export function base64ToBytes(str: string): Uint8Array {
    // Prefer browser atob when available
    if (typeof atob === 'function') {
        const byteStr = atob(str);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) {
            arr[i] = byteStr.charCodeAt(i);
        }
        return arr;
    }
    // If Node Buffer is available, use it
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
        return new Uint8Array(Buffer.from(str, 'base64'));
    }
    // Fallback: pure JS base64 decoder (handles padding)
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < lookup.length; i++) lookup[i] = 255;
    for (let i = 0; i < b64.length; i++) lookup[b64.charCodeAt(i)] = i;
    const len = str.length;
    // calculate buffer length
    let placeHolders = 0;
    if (str.charAt(len - 1) === '=') placeHolders++;
    if (str.charAt(len - 2) === '=') placeHolders++;
    const arrLen = ((len * 3) / 4) - placeHolders;
    const bytes = new Uint8Array(arrLen | 0);
    let L = 0;
    for (let i = 0; i < len; i += 4) {
        const enc1 = lookup[str.charCodeAt(i)];
        const enc2 = lookup[str.charCodeAt(i + 1)];
        const enc3 = lookup[str.charCodeAt(i + 2)];
        const enc4 = lookup[str.charCodeAt(i + 3)];
        const c1 = (enc1 << 2) | (enc2 >> 4);
        const c2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const c3 = ((enc3 & 3) << 6) | enc4;
        bytes[L++] = c1;
        if (enc3 !== 64 && L < arrLen) bytes[L++] = c2;
        if (enc4 !== 64 && L < arrLen) bytes[L++] = c3;
    }
    return bytes;
}

export function bytesToBase64(arr: Bytes): string {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    if (typeof btoa === 'function') {
        let str = '';
        for (let i = 0; i < intArr.length; i++) {
            str += String.fromCharCode(intArr[i]);
        }
        return btoa(str);
    }
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
        const buffer = Buffer.from(intArr as any);
        return buffer.toString('base64');
    }
    // Fallback: pure JS base64 encoder
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i: number;
    const len = intArr.length;
    for (i = 0; i < len; i += 3) {
        const a = intArr[i];
        const b = i + 1 < len ? intArr[i + 1] : 0;
        const c = i + 2 < len ? intArr[i + 2] : 0;
        const triplet = (a << 16) | (b << 8) | c;
        result += b64[(triplet >> 18) & 0x3f];
        result += b64[(triplet >> 12) & 0x3f];
        result += i + 1 < len ? b64[(triplet >> 6) & 0x3f] : '=';
        result += i + 2 < len ? b64[triplet & 0x3f] : '=';
    }
    return result;
}

export function hexToBytes(hex: string): Uint8Array {
    const arr = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return arr;
}

export function bytesToHex(arr: Bytes): string {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    let str = '';
    for (let i = 0; i < intArr.length; i++) {
        const byte = intArr[i].toString(16);
        if (byte.length === 1) {
            str += '0';
        }
        str += byte;
    }
    return str;
}

export function arrayToBuffer(arr: Bytes): ArrayBuffer {
    // Always return a plain ArrayBuffer (not SharedArrayBuffer). If input
    // already is an ArrayBuffer, return it directly. If input is a
    // Uint8Array (a view), construct a new Uint8Array copy and return its
    // underlying buffer — this guarantees an ArrayBuffer and avoids TS
    // complaints about SharedArrayBuffer.
    if (arr instanceof ArrayBuffer) {
        return arr;
    }
    // Create a copy into a fresh ArrayBuffer and return that buffer.
    return new Uint8Array(arr).buffer;
}

export function zeroBuffer(arr: Bytes): void {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    intArr.fill(0);
}
