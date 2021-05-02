import * as CryptoEngine from './../crypto/crypto-engine';
import { ProtectedValue } from '../crypto/protected-value';
import { arrayToBuffer, bytesToHex } from '../utils/byte-utils';

export type KdbxBinaryRef = { ref: string };
export type KdbxBinaryRefWithValue = { ref: string; value: KdbxBinary };
export type KdbxBinaryWithHash = { hash: string; value: KdbxBinary };

export type KdbxBinary = ProtectedValue | ArrayBuffer;
export type KdbxBinaryOrRef = KdbxBinary | KdbxBinaryRef;
export type KdbxBinaryIn = KdbxBinary | Uint8Array;

export class KdbxBinaries {
    // temporary map used during database loading
    private readonly _mapById = new Map<string, KdbxBinary>();
    // in runtime, entries are addressed by hash
    private readonly _mapByHash = new Map<string, KdbxBinary>();
    // kept to be able to find binaries by id as well
    private readonly _idToHash = new Map<string, string>();

    computeHashes(): Promise<void> {
        // this method is called after the file is loaded
        const promises = [...this._mapById].map(([id, binary]) =>
            KdbxBinaries.getBinaryHash(binary).then((hash) => {
                this._idToHash.set(id, hash);
                this._mapByHash.set(hash, binary);
            })
        );
        return Promise.all(promises).then(() => {
            // it won't be used anymore
            this._mapById.clear();
        });
    }

    private static getBinaryHash(binary: KdbxBinaryIn): Promise<string> {
        let promise;
        if (binary instanceof ProtectedValue) {
            promise = binary.getHash();
        } else {
            binary = arrayToBuffer(binary);
            promise = CryptoEngine.sha256(binary);
        }
        return promise.then(bytesToHex);
    }

    add(value: KdbxBinaryIn): Promise<KdbxBinaryWithHash> {
        // called after load
        if (value instanceof Uint8Array) {
            value = arrayToBuffer(value);
        }
        return KdbxBinaries.getBinaryHash(value).then((hash) => {
            this._mapByHash.set(hash, value);
            return { hash, value };
        });
    }

    addWithNextId(value: KdbxBinaryIn): void {
        // called during load (v4), when building the id map
        const id = this._mapById.size.toString();
        this.addWithId(id, value);
    }

    addWithId(id: string, value: KdbxBinaryIn): void {
        // called during load (v3), when building the id map
        if (value instanceof Uint8Array) {
            value = arrayToBuffer(value);
        }
        this._mapById.set(id, value);
    }

    addWithHash(binary: KdbxBinaryWithHash): void {
        this._mapByHash.set(binary.hash, binary.value);
    }

    deleteWithHash(hash: string): void {
        this._mapByHash.delete(hash);
    }

    getByRef(binaryRef: KdbxBinaryRef): KdbxBinaryWithHash | undefined {
        const hash = this._idToHash.get(binaryRef.ref);
        if (!hash) {
            return undefined;
        }
        const value = this._mapByHash.get(hash);
        if (!value) {
            return undefined;
        }
        return { hash, value };
    }

    getRefByHash(hash: string): KdbxBinaryRef | undefined {
        const ref = [...this._mapByHash.keys()].indexOf(hash);
        if (ref < 0) {
            return undefined;
        }
        return { ref: ref.toString() };
    }

    getAll(): KdbxBinaryRefWithValue[] {
        return [...this._mapByHash.values()].map((value, index) => {
            return { ref: index.toString(), value };
        });
    }

    getAllWithHashes(): KdbxBinaryWithHash[] {
        return [...this._mapByHash].map(([hash, value]) => ({
            hash,
            value
        }));
    }

    getValueByHash(hash: string): KdbxBinary | undefined {
        return this._mapByHash.get(hash);
    }

    static isKdbxBinaryRef(binary: KdbxBinaryOrRef | undefined): binary is KdbxBinaryRef {
        return !!(binary as KdbxBinaryRef)?.ref;
    }

    static isKdbxBinaryWithHash(
        binary: KdbxBinaryOrRef | KdbxBinaryWithHash | undefined
    ): binary is KdbxBinaryWithHash {
        return !!(binary as KdbxBinaryWithHash)?.hash;
    }
}
