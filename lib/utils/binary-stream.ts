export class BinaryStream {
    private _arrayBuffer: ArrayBuffer;
    private _dataView: DataView;
    private _pos: number;
    private readonly _canExpand: boolean;

    constructor(arrayBuffer?: ArrayBuffer) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(1024);
        this._dataView = new DataView(this._arrayBuffer);
        this._pos = 0;
        this._canExpand = !arrayBuffer;
    }

    get pos(): number {
        return this._pos;
    }

    get byteLength(): number {
        return this._arrayBuffer.byteLength;
    }

    readBytes(size: number): ArrayBuffer {
        const buffer = this._arrayBuffer.slice(this._pos, this._pos + size);
        this._pos += size;
        return buffer;
    }

    readBytesToEnd(): ArrayBuffer {
        const size = this._arrayBuffer.byteLength - this._pos;
        return this.readBytes(size);
    }

    readBytesNoAdvance(startPos: number, endPos: number): ArrayBuffer {
        return this._arrayBuffer.slice(startPos, endPos);
    }

    writeBytes(bytes: ArrayBuffer | Uint8Array): void {
        const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
        this.checkCapacity(arr.length);
        new Uint8Array(this._arrayBuffer).set(arr, this._pos);
        this._pos += arr.length;
    }

    getWrittenBytes(): ArrayBuffer {
        return this._arrayBuffer.slice(0, this._pos);
    }

    private checkCapacity(addBytes: number): void {
        const available = this._arrayBuffer.byteLength - this._pos;
        if (this._canExpand && available < addBytes) {
            let newLen = this._arrayBuffer.byteLength;
            const requestedLen = this._pos + addBytes;
            while (newLen < requestedLen) {
                newLen *= 2;
            }
            const newData = new Uint8Array(newLen);
            newData.set(new Uint8Array(this._arrayBuffer));
            this._arrayBuffer = newData.buffer;
            this._dataView = new DataView(this._arrayBuffer);
        }
    }

    getInt8(): number {
        const value = this._dataView.getInt8(this._pos);
        this._pos += 1;
        return value;
    }

    setInt8(value: number): void {
        this.checkCapacity(1);
        this._dataView.setInt8(this._pos, value);
        this._pos += 1;
    }

    getUint8(): number {
        const value = this._dataView.getUint8(this._pos);
        this._pos += 1;
        return value;
    }

    setUint8(value: number): void {
        this.checkCapacity(1);
        this._dataView.setUint8(this._pos, value);
        this._pos += 1;
    }

    getInt16(littleEndian: boolean): number {
        const value = this._dataView.getInt16(this._pos, littleEndian);
        this._pos += 2;
        return value;
    }

    setInt16(value: number, littleEndian: boolean): void {
        this.checkCapacity(2);
        this._dataView.setInt16(this._pos, value, littleEndian);
        this._pos += 2;
    }

    getUint16(littleEndian: boolean): number {
        const value = this._dataView.getUint16(this._pos, littleEndian);
        this._pos += 2;
        return value;
    }

    setUint16(value: number, littleEndian: boolean): void {
        this.checkCapacity(2);
        this._dataView.setUint16(this._pos, value, littleEndian);
        this._pos += 2;
    }

    getInt32(littleEndian: boolean): number {
        const value = this._dataView.getInt32(this._pos, littleEndian);
        this._pos += 4;
        return value;
    }

    setInt32(value: number, littleEndian: boolean): void {
        this.checkCapacity(4);
        this._dataView.setInt32(this._pos, value, littleEndian);
        this._pos += 4;
    }

    getUint32(littleEndian: boolean): number {
        const value = this._dataView.getUint32(this._pos, littleEndian);
        this._pos += 4;
        return value;
    }

    setUint32(value: number, littleEndian: boolean): void {
        this.checkCapacity(4);
        this._dataView.setUint32(this._pos, value, littleEndian);
        this._pos += 4;
    }

    getFloat32(littleEndian: boolean): number {
        const value = this._dataView.getFloat32(this._pos, littleEndian);
        this._pos += 4;
        return value;
    }

    setFloat32(value: number, littleEndian: boolean): void {
        this.checkCapacity(4);
        this._dataView.setFloat32(this._pos, value, littleEndian);
        this._pos += 4;
    }

    getFloat64(littleEndian: boolean): number {
        const value = this._dataView.getFloat64(this._pos, littleEndian);
        this._pos += 8;
        return value;
    }

    setFloat64(value: number, littleEndian: boolean): void {
        this.checkCapacity(8);
        this._dataView.setFloat64(this._pos, value, littleEndian);
        this._pos += 8;
    }

    getUint64(littleEndian: boolean): number {
        let part1 = this.getUint32(littleEndian),
            part2 = this.getUint32(littleEndian);
        if (littleEndian) {
            part2 *= 0x100000000;
        } else {
            part1 *= 0x100000000;
        }
        return part1 + part2;
    }

    setUint64(value: number, littleEndian: boolean): void {
        if (littleEndian) {
            this.setUint32(value & 0xffffffff, true);
            this.setUint32(Math.floor(value / 0x100000000), true);
        } else {
            this.checkCapacity(8);
            this.setUint32(Math.floor(value / 0x100000000), false);
            this.setUint32(value & 0xffffffff, false);
        }
    }
}
