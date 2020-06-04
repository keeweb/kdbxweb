'use strict';

/**
 * Represents 64-bit number
 * @param {number} [lo=0]
 * @param {number} [hi=0]
 * @constructor
 */
function Int64(lo, hi) {
    this.lo = lo || 0;
    this.hi = hi || 0;
}

/**
 * Number value as float
 * @returns {Number}
 */
Object.defineProperty(Int64.prototype, 'value', {
    enumerable: true,
    get: function () {
        if (this.hi) {
            if (this.hi >= 0x200000) {
                throw new Error('too large number');
            }
            return this.hi * 0x100000000 + this.lo;
        }
        return this.lo;
    }
});

/**
 * Gets number value
 * @returns {Number}
 */
Int64.prototype.valueOf = function () {
    return this.value;
};

/**
 * Creates int64 from number
 * @param {number} value
 * @returns {Int64}
 * @static
 */
Int64.from = function (value) {
    if (value > 0x1fffffffffffff) {
        throw new Error('too large number');
    }
    var lo = value >>> 0;
    var hi = ((value - lo) / 0x100000000) >>> 0;
    return new Int64(lo, hi);
};

module.exports = Int64;
