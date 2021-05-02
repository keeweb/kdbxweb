import expect from 'expect.js';
import { Int64 } from '../../lib';

describe('Int64', () => {
    it('creates empty int64', () => {
        const i = new Int64();
        expect(i.hi).to.be(0);
        expect(i.lo).to.be(0);
        expect(i.value).to.be(0);
        expect(i.valueOf()).to.be(0);
    });

    it('creates int64 with low part', () => {
        const i = new Int64(0x123);
        expect(i.hi).to.be(0);
        expect(i.lo).to.be(0x123);
        expect(i.value).to.be(0x123);
        expect(i.valueOf()).to.be(0x123);
    });

    it('creates int64 with low and high parts', () => {
        const i = new Int64(0x123, 0x456);
        expect(i.hi).to.be(0x456);
        expect(i.lo).to.be(0x123);
        expect(i.value).to.be(0x45600000123);
        expect(i.valueOf()).to.be(0x45600000123);
    });

    it('creates int64 with large value', () => {
        const i = Int64.from(0x45600000123);
        expect(i.hi).to.be(0x456);
        expect(i.lo).to.be(0x123);
        expect(i.value).to.be(0x45600000123);
        expect(i.valueOf()).to.be(0x45600000123);
    });

    it('throws error for too high number conversion', () => {
        const i = new Int64(0xffffffff, 0xffffffff);
        expect(() => i.value).to.throwException((e) => {
            expect(e.message).to.be('too large number');
        });
    });

    it('throws error for too high number creation', () => {
        expect(() => {
            // eslint-disable-next-line no-loss-of-precision
            Int64.from(0xffffffffffffff);
        }).to.throwException((e) => {
            expect(e.message).to.be('too large number');
        });
    });
});
