class KdbxError extends Error {
    public readonly code: string;

    constructor(code: string, message?: string) {
        super('Error ' + code + (message ? ': ' + message : ''));

        this.name = 'KdbxError';
        this.code = code;
    }
}

export { KdbxError };
