import { KdbxError } from '../errors/kdbx-error';
import { ErrorCodes } from '../defs/consts';
import { arrayToBuffer, bytesToString, stringToBytes } from './byte-utils';
import { Int64 } from './int64';
import { BinaryStream } from './binary-stream';

const MaxSupportedVersion = 1;
const DefaultVersion = 0x0100;

export enum ValueType {
    UInt32 = 0x04,
    UInt64 = 0x05,
    Bool = 0x08,
    Int32 = 0x0c,
    Int64 = 0x0d,
    String = 0x18,
    Bytes = 0x42
}

export type VarDictionaryAnyValue = number | Int64 | boolean | string | ArrayBuffer | undefined;

interface VarDictionaryItemInt {
    type: ValueType.UInt32 | ValueType.Int32;
    key: string;
    value: number;
}

interface VarDictionaryItemInt64 {
    type: ValueType.UInt64 | ValueType.Int64;
    key: string;
    value: Int64;
}

interface VarDictionaryItemBool {
    type: ValueType.Bool;
    key: string;
    value: boolean;
}

interface VarDictionaryItemString {
    type: ValueType.String;
    key: string;
    value: string;
}

interface VarDictionaryItemBytes {
    type: ValueType.Bytes;
    key: string;
    value: ArrayBuffer;
}

type VarDictionaryItem =
    | VarDictionaryItemInt
    | VarDictionaryItemInt64
    | VarDictionaryItemBool
    | VarDictionaryItemString
    | VarDictionaryItemBytes;

export class VarDictionary {
    private _items: VarDictionaryItem[] = [];
    private readonly _map = new Map<string, VarDictionaryItem>();

    static readonly ValueType = ValueType;

    keys(): string[] {
        return this._items.map((item) => item.key);
    }

    get length(): number {
        return this._items.length;
    }

    get(key: string): VarDictionaryAnyValue {
        const item = this._map.get(key);
        return item ? item.value : undefined;
    }

    set(key: string, type: ValueType, value: VarDictionaryAnyValue): void {
        let item: VarDictionaryItem;

        switch (type) {
            case ValueType.UInt32:
                if (typeof value !== 'number' || value < 0) {
                    throw new KdbxError(ErrorCodes.InvalidArg);
                }
                item = { key, type, value };
                break;
            case ValueType.UInt64:
                if (!(value instanceof Int64)) {
                    throw new KdbxError(ErrorCodes.InvalidArg);
                }
                item = { key, type, value };
                break;
            case ValueType.Bool:
                if (typeof value !== 'boolean') {
                    throw new KdbxError(ErrorCodes.InvalidArg);
                }
                item = { key, type, value };
                break;
            case ValueType.Int32:
                if (typeof value !== 'number') {
                    throw new KdbxError(ErrorCodes.InvalidArg);
                }
                item = { key, type, value };
                break;
            case ValueType.Int64:
                if (!(value instanceof Int64)) {
                    throw new KdbxError(ErrorCodes.InvalidArg);
                }
                item = { key, type, value };
                break;
            case ValueType.String:
                if (typeof value !== 'string') {
                    throw new KdbxError(ErrorCodes.InvalidArg);
                }
                item = { key, type, value };
                break;
            case ValueType.Bytes:
                if (value instanceof Uint8Array) {
                    value = arrayToBuffer(value);
                }
                if (!(value instanceof ArrayBuffer)) {
                    throw new KdbxError(ErrorCodes.InvalidArg);
                }
                item = { key, type, value };
                break;
            default:
                throw new KdbxError(ErrorCodes.InvalidArg);
        }

        const existing = this._map.get(key);
        if (existing) {
            const ix = this._items.indexOf(existing);
            this._items.splice(ix, 1, item);
        } else {
            this._items.push(item);
        }

        this._map.set(key, item);
    }

    remove(key: string): void {
        this._items = this._items.filter((item) => {
            return item.key !== key;
        });
        this._map.delete(key);
    }

    static read(stm: BinaryStream): VarDictionary {
        const dict = new VarDictionary();
        dict.readVersion(stm);
        for (let item; (item = dict.readItem(stm)); ) {
            dict._items.push(item);
            dict._map.set(item.key, item);
        }
        return dict;
    }

    private readVersion(stm: BinaryStream): void {
        stm.getUint8();
        const versionMajor = stm.getUint8();
        if (versionMajor === 0 || versionMajor > MaxSupportedVersion) {
            throw new KdbxError(ErrorCodes.InvalidVersion);
        }
    }

    private readItem(stm: BinaryStream): VarDictionaryItem | undefined {
        const type = <ValueType>stm.getUint8();
        if (!type) {
            return undefined;
        }
        const keyLength = stm.getInt32(true);
        if (keyLength <= 0) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'bad key length');
        }
        const key = bytesToString(stm.readBytes(keyLength));
        const valueLength = stm.getInt32(true);
        if (valueLength < 0) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'bad value length');
        }
        switch (type) {
            case ValueType.UInt32: {
                if (valueLength !== 4) {
                    throw new KdbxError(ErrorCodes.FileCorrupt, 'bad uint32');
                }
                const value = stm.getUint32(true);
                return { key, type, value };
            }
            case ValueType.UInt64: {
                if (valueLength !== 8) {
                    throw new KdbxError(ErrorCodes.FileCorrupt, 'bad uint64');
                }
                const loInt = stm.getUint32(true);
                const hiInt = stm.getUint32(true);
                const value = new Int64(loInt, hiInt);
                return { key, type, value };
            }
            case ValueType.Bool: {
                if (valueLength !== 1) {
                    throw new KdbxError(ErrorCodes.FileCorrupt, 'bad bool');
                }
                const value = stm.getUint8() !== 0;
                return { key, type, value };
            }
            case ValueType.Int32: {
                if (valueLength !== 4) {
                    throw new KdbxError(ErrorCodes.FileCorrupt, 'bad int32');
                }
                const value = stm.getInt32(true);
                return { key, type, value };
            }
            case ValueType.Int64: {
                if (valueLength !== 8) {
                    throw new KdbxError(ErrorCodes.FileCorrupt, 'bad int64');
                }
                const loUint = stm.getUint32(true);
                const hiUint = stm.getUint32(true);
                const value = new Int64(loUint, hiUint);
                return { key, type, value };
            }
            case ValueType.String: {
                const value = bytesToString(stm.readBytes(valueLength));
                return { key, type, value };
            }
            case ValueType.Bytes: {
                const value = stm.readBytes(valueLength);
                return { key, type, value };
            }
            default:
                throw new KdbxError(ErrorCodes.FileCorrupt, `bad value type: ${type}`);
        }
    }

    write(stm: BinaryStream): void {
        this.writeVersion(stm);
        for (const item of this._items) {
            this.writeItem(stm, item);
        }
        stm.setUint8(0);
    }

    private writeVersion(stm: BinaryStream): void {
        stm.setUint16(DefaultVersion, true);
    }

    private writeItem(stm: BinaryStream, item: VarDictionaryItem) {
        stm.setUint8(item.type);

        const keyBytes = stringToBytes(item.key);
        stm.setInt32(keyBytes.length, true);
        stm.writeBytes(keyBytes);

        switch (item.type) {
            case ValueType.UInt32:
                stm.setInt32(4, true);
                stm.setUint32(item.value, true);
                break;
            case ValueType.UInt64:
                stm.setInt32(8, true);
                stm.setUint32(item.value.lo, true);
                stm.setUint32(item.value.hi, true);
                break;
            case ValueType.Bool:
                stm.setInt32(1, true);
                stm.setUint8(item.value ? 1 : 0);
                break;
            case ValueType.Int32:
                stm.setInt32(4, true);
                stm.setInt32(item.value, true);
                break;
            case ValueType.Int64:
                stm.setInt32(8, true);
                stm.setUint32(item.value.lo, true);
                stm.setUint32(item.value.hi, true);
                break;
            case ValueType.String: {
                const strBytes = stringToBytes(item.value);
                stm.setInt32(strBytes.length, true);
                stm.writeBytes(strBytes);
                break;
            }
            case ValueType.Bytes: {
                const bytesBuffer = arrayToBuffer(item.value);
                stm.setInt32(bytesBuffer.byteLength, true);
                stm.writeBytes(bytesBuffer);
                break;
            }
            default:
                throw new KdbxError(ErrorCodes.Unsupported);
        }
    }
}
