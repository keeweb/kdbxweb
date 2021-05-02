import expect from 'expect.js';
import { ByteUtils, ProtectedValue } from '../../lib';

describe('ProtectedValue', () => {
    const valueBytes = ByteUtils.stringToBytes('strvalue'),
        encValueBytes = ByteUtils.stringToBytes('strvalue'),
        saltBytes = new Uint8Array(valueBytes.length);
    for (let i = 0; i < saltBytes.length; i++) {
        saltBytes[i] = i;
        encValueBytes[i] ^= i;
    }

    it('decrypts salted value in string', () => {
        const value = new ProtectedValue(encValueBytes, saltBytes);
        expect(value.getText()).to.be('strvalue');
    });

    it('returns string in binary', () => {
        const value = new ProtectedValue(encValueBytes, saltBytes);
        expect(value.getBinary()).to.be.eql(valueBytes);
    });

    it('checks substring', () => {
        const value = new ProtectedValue(encValueBytes, saltBytes);
        expect(value.includes('test')).to.be(false);
        expect(value.includes('str')).to.be(true);
        expect(value.includes('val')).to.be(true);
        expect(value.includes('value')).to.be(true);
        expect(value.includes('')).to.be(false);
    });

    it('calculates SHA512 hash', () => {
        const value = new ProtectedValue(encValueBytes, saltBytes);
        return value.getHash().then((hash) => {
            expect(ByteUtils.bytesToHex(hash)).to.be(
                '1f5c3ef76d43e72ee2c5216c36187c799b153cab3d0cb63a6f3ecccc2627f535'
            );
        });
    });

    it('creates value from string', () => {
        const value = ProtectedValue.fromString('test');
        expect(value.getText()).to.be('test');
    });

    it('creates value from binary', () => {
        const value = ProtectedValue.fromBinary(ByteUtils.stringToBytes('test'));
        expect(value.getText()).to.be('test');
    });

    it('returns byte length', () => {
        const value = ProtectedValue.fromBinary(ByteUtils.stringToBytes('test'));
        expect(value.byteLength).to.be(4);
    });

    it('can change salt', () => {
        const value = ProtectedValue.fromString('test');
        expect(value.getText()).to.be('test');
        value.setSalt(new Uint8Array([1, 2, 3, 4]).buffer);
        expect(value.getText()).to.be('test');
    });

    it('returns protected value as base64 string', () => {
        const value = ProtectedValue.fromBinary(ByteUtils.stringToBytes('test'));
        value.setSalt(new Uint8Array([1, 2, 3, 4]).buffer);
        expect(value.toString()).to.be('dWdwcA==');
    });

    it('clones itself', () => {
        const value = ProtectedValue.fromString('test').clone();
        expect(value.getText()).to.be('test');
    });
});
