import expect from 'expect.js';
import { KdbxUuid } from '../../lib';

describe('KdbxUuid', () => {
    it('creates uuid from 16 bytes ArrayBuffer', () => {
        const uuid = new KdbxUuid(
            new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6]).buffer
        );
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates uuid from 16 bytes array', () => {
        const uuid = new KdbxUuid(
            new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6])
        );
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates uuid base64 string', () => {
        const uuid = new KdbxUuid('AQIDBAUGBwgJCgECAwQFBg==');
        expect(uuid.id).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('throws an error for less than 16 bytes', () => {
        try {
            const uuid = new KdbxUuid(new Uint16Array([123]).buffer);
            throw new Error(`Expected an error to be thrown, got UUID instead: ${uuid}`);
        } catch (e) {
            expect(e.message).to.contain('FileCorrupt: bad UUID length: 2');
        }
    });

    it('creates empty uuid from undefined', () => {
        const uuid = new KdbxUuid(undefined);
        expect(uuid.id).to.be('AAAAAAAAAAAAAAAAAAAAAA==');
        expect(uuid.empty).to.be(true);
    });

    it('returns uuid in toString method', () => {
        const uuid = new KdbxUuid(
            new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6]).buffer
        );
        expect(uuid.toString()).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('returns uuid in valueOf method', () => {
        const uuid = new KdbxUuid(
            new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6]).buffer
        );
        expect(uuid.valueOf()).to.be('AQIDBAUGBwgJCgECAwQFBg==');
    });

    it('creates empty uuid from no arg', () => {
        const uuid = new KdbxUuid();
        expect(uuid.toString()).to.be('AAAAAAAAAAAAAAAAAAAAAA==');
        expect(uuid.empty).to.be(true);
    });

    it('sets empty property for empty uuid', () => {
        const uuid = new KdbxUuid(new Uint8Array(16).buffer);
        expect(uuid.toString()).to.be('AAAAAAAAAAAAAAAAAAAAAA==');
        expect(uuid.empty).to.be(true);
    });

    it('returns bytes in toBytes method', () => {
        const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6]);
        const uuid = new KdbxUuid(bytes.buffer);
        expect(uuid.toBytes()).to.be.eql(bytes);
    });

    it('returns bytes in bytes property', () => {
        const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6]);
        const uuid = new KdbxUuid(bytes.buffer);
        expect(uuid.bytes).to.be.eql(bytes);
    });

    it('returns bytes in toBytes method for empty value', () => {
        const uuid = new KdbxUuid();
        expect(uuid.toBytes()).to.be.eql([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('generates random uuid', () => {
        const uuid = KdbxUuid.random();
        expect(uuid).to.be.a(KdbxUuid);
        expect(uuid.toString()).not.to.be('AAAAAAAAAAAAAAAAAAAAAA==');
    });

    it('checks equality', () => {
        const uuid = new KdbxUuid(
            new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6]).buffer
        );
        expect(uuid.equals('AQIDBAUGBwgJCgECAwQFBg==')).to.be(true);
        expect(uuid.equals(new KdbxUuid('AQIDBAUGBwgJCgECAwQFBg=='))).to.be(true);
        expect(uuid.equals(undefined)).to.be(false);
        expect(uuid.equals(null)).to.be(false);
        expect(uuid.equals('')).to.be(false);
        expect(uuid.equals('???')).to.be(false);
        expect(uuid.equals(new KdbxUuid())).to.be(false);
    });
});
