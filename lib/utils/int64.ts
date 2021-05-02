class Int64 {
    public readonly lo: number;
    public readonly hi: number;

    constructor(lo = 0, hi = 0) {
        this.lo = lo;
        this.hi = hi;
    }

    get value(): number {
        if (this.hi) {
            if (this.hi >= 0x200000) {
                throw new Error('too large number');
            }
            return this.hi * 0x100000000 + this.lo;
        }
        return this.lo;
    }

    valueOf(): number {
        return this.value;
    }

    static from(value: number): Int64 {
        if (value > 0x1fffffffffffff) {
            throw new Error('too large number');
        }
        const lo = value >>> 0;
        const hi = ((value - lo) / 0x100000000) >>> 0;
        return new Int64(lo, hi);
    }
}

export { Int64 };
