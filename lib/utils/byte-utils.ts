const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type ArrayBufferOrArray = ArrayBuffer | Uint8Array;

export function arrayBufferEquals(ab1: ArrayBuffer, ab2: ArrayBuffer): boolean {
    if (ab1.byteLength !== ab2.byteLength) {
        return false;
    }
    const arr1 = new Uint8Array(ab1);
    const arr2 = new Uint8Array(ab2);
    for (let i = 0, len = arr1.length; i < len; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

export function bytesToString(arr: ArrayBufferOrArray): string {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    return textDecoder.decode(arr);
}

export function stringToBytes(str: string): Uint8Array {
    return textEncoder.encode(str);
}

export function base64ToBytes(str: string): Uint8Array {
    if (typeof atob === 'function') {
        const byteStr = atob(str);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) {
            arr[i] = byteStr.charCodeAt(i);
        }
        return arr;
    } else {
        const buffer = Buffer.from(str, 'base64');
        return new Uint8Array(buffer);
    }
}

export function bytesToBase64(arr: ArrayBufferOrArray): string {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    if (typeof btoa === 'function') {
        let str = '';
        for (let i = 0; i < intArr.length; i++) {
            str += String.fromCharCode(intArr[i]);
        }
        return btoa(str);
    } else {
        const buffer = Buffer.from(arr);
        return buffer.toString('base64');
    }
}

export function hexToBytes(hex: string): Uint8Array {
    const arr = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return arr;
}

export function bytesToHex(arr: ArrayBufferOrArray): string {
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

export function arrayToBuffer(arr: ArrayBufferOrArray): ArrayBuffer {
    if (arr instanceof ArrayBuffer) {
        return arr;
    }
    const ab = arr.buffer;
    if (arr.byteOffset === 0 && arr.byteLength === ab.byteLength) {
        return ab;
    }
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

export function zeroBuffer(arr: ArrayBufferOrArray): void {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    intArr.fill(0);
}
