import { base64ToBytes, bytesToBase64, arrayToBuffer } from '../utils/byte-utils';
import { Bytes } from '../defs/bytes';
import { ErrorCodes } from '../defs/consts';
import { KdbxError } from '../errors/kdbx-error';
import * as CryptoEngine from '../crypto/crypto-engine';

const UuidLength = 16;
const EmptyUuidStr = 'AAAAAAAAAAAAAAAAAAAAAA==';

export class KdbxUuid {
    readonly id: string;
    readonly empty: boolean;

    constructor(ab?: Bytes | string) {
        if (ab === undefined) {
            ab = new ArrayBuffer(UuidLength);
        } else if (typeof ab === 'string') {
            ab = arrayToBuffer(base64ToBytes(ab));
        }
        const buf = ab instanceof ArrayBuffer ? ab : arrayToBuffer(ab as Uint8Array);
        if (buf.byteLength !== UuidLength) {
            throw new KdbxError(ErrorCodes.FileCorrupt, `bad UUID length: ${buf.byteLength}`);
        }
        this.id = bytesToBase64(buf);
        this.empty = this.id === EmptyUuidStr;
    }

    equals(other: KdbxUuid | string | null | undefined): boolean {
        return (other && other.toString() === this.toString()) || false;
    }

    // Return a Uint8Array view for callers that expect an indexed byte array
    get bytes(): Uint8Array {
        return this.toBytes();
    }

    static random(): KdbxUuid {
        return new KdbxUuid(arrayToBuffer(CryptoEngine.random(UuidLength)));
    }

    toString(): string {
        return this.id;
    }

    valueOf(): string {
        return this.id;
    }

    toBytes(): Uint8Array {
        return new Uint8Array(arrayToBuffer(base64ToBytes(this.id)));
    }
}
