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
    get: function() {
        if (this.hi) {
            if (this.hi >= 0x200000) {
                throw new Error('too large number');
            }
            return this.hi * 0x100000000 + this.lo;
        }
        return this.lo;
    }
});

module.exports = Int64;
