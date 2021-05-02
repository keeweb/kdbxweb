import expect from 'expect.js';
import { KdbxError } from '../../lib';

describe('KdbxError', () => {
    it('creates error without message', () => {
        const err = new KdbxError('1');
        expect(err.name).to.be('KdbxError');
        expect(err.code).to.be('1');
        expect(err.message).to.be('Error 1');
        expect(err.toString()).to.be('KdbxError: Error 1');
    });

    it('creates error with message', () => {
        const err = new KdbxError('2', 'msg');
        expect(err.name).to.be('KdbxError');
        expect(err.code).to.be('2');
        expect(err.message).to.be('Error 2: msg');
        expect(err.toString()).to.be('KdbxError: Error 2: msg');
    });
});
