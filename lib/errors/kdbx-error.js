'use strict';

function KdbxError(code, message) {
    this.name = 'KdbxError';
    this.code = code;
    this.message = 'Error ' + code + (message ? ': ' + message : '');
}

KdbxError.prototype = Error.prototype;

module.exports = KdbxError;
