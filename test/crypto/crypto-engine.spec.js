'use strict';

var expect = require('expect.js'),
    SubtleMockNode = require('../test-support/subtle-mock-node'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    CryptoEngine = require('../../lib').CryptoEngine;

function fromHex(str) {
    return ByteUtils.arrayToBuffer(ByteUtils.hexToBytes(str));
}

function toHex(bytes) {
    if (!(bytes instanceof ArrayBuffer)) {
        throw 'Not ArrayBuffer';
    }
    return ByteUtils.bytesToHex(bytes);
}

var subtle = CryptoEngine.subtle;
var webCrypto = CryptoEngine.webCrypto;
var nodeCrypto = CryptoEngine.nodeCrypto;

function useDefaultImpl() {
    CryptoEngine.configure(subtle, webCrypto, nodeCrypto);
}

function useNoImpl() {
    CryptoEngine.configure(null, null, null);
}

function useSubtleMock() {
    CryptoEngine.configure(SubtleMockNode.subtle, SubtleMockNode, null);
}

describe('CryptoEngine', function() {
    afterEach(useDefaultImpl);

    describe('sha256', function() {
        var src = 'f03f102fa66d1847535a85ffc09c3911d1d56887c451832448df3cbac293be4b';
        var exp = 'affa378dae878f64d10f302df67c614ebb901601dd53a51713ffe664850c833b';
        var expEmpty = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

        it('calculates sha256', function() {
            useDefaultImpl();
            return CryptoEngine.sha256(fromHex(src)).then(function(hash) {
                expect(toHex(hash)).to.be(exp);
            });
        });

        it('calculates sha256 of empty data', function() {
            useDefaultImpl();
            return CryptoEngine.sha256(new ArrayBuffer(0)).then(function(hash) {
                expect(toHex(hash)).to.be(expEmpty);
            });
        });

        if (SubtleMockNode) {
            it('calculates sha256 with subtle', function() {
                useSubtleMock();
                return CryptoEngine.sha256(fromHex(src)).then(function(hash) {
                    expect(toHex(hash)).to.be(exp);
                });
            });
        }

        it('throws error if sha256 is not implemented', function() {
            useNoImpl();
            return CryptoEngine.sha256(fromHex(src))
                .then(function() { throw 'No error generated'; })
                .catch(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: SHA256 not implemented'); });
        });
    });

    describe('sha512', function() {
        var src = 'f03f102fa66d1847535a85ffc09c3911d1d56887c451832448df3cbac293be4b';
        var exp = '8425338d314de7b33d2be207494bd10335c543b9e354ed9316400bf86ecca4b8' +
            '707b22e3a7f3f32b1b0e83793137f5cdbff4c5cfd331ca66dc4887a10594257f';
        var expEmpty = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce' +
            '47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';

        it('calculates sha512', function() {
            useDefaultImpl();
            return CryptoEngine.sha512(fromHex(src)).then(function(hash) {
                expect(toHex(hash)).to.be(exp);
            });
        });

        it('calculates sha512 of empty data', function() {
            useDefaultImpl();
            return CryptoEngine.sha512(new ArrayBuffer(0)).then(function(hash) {
                expect(toHex(hash)).to.be(expEmpty);
            });
        });

        if (SubtleMockNode) {
            it('calculates sha512 with subtle', function() {
                useSubtleMock();
                return CryptoEngine.sha512(fromHex(src)).then(function(hash) {
                    expect(toHex(hash)).to.be(exp);
                });
            });
        }

        it('throws error if sha512 is not implemented', function() {
            useNoImpl();
            return CryptoEngine.sha512(fromHex(src))
                .then(function() { throw 'No error generated'; })
                .catch(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: SHA512 not implemented'); });
        });
    });

    describe('hmacSha256', function() {
        var data = '14af83cb4ecb6e1773a0ff0fa607e2e96a43dbeeade61291c52ab3853b1dda9d';
        var key = 'c50d2f8d0d51ba443ec46f7f843bf17491b8c0a09b58437acd589b14b73aa35c';
        var exp = 'f25a33a0424440b91d98cb4d9c0e897ff0a1f48c78820e6374257cf7fa774fb2';

        it('calculates hmac-sha256', function() {
            useDefaultImpl();
            return CryptoEngine.hmacSha256(fromHex(key), fromHex(data)).then(function(hash) {
                expect(toHex(hash)).to.be(exp);
            });
        });

        if (SubtleMockNode) {
            it('calculates hmac-sha256 with subtle', function() {
                useSubtleMock();
                return CryptoEngine.hmacSha256(fromHex(key), fromHex(data)).then(function(hash) {
                    expect(toHex(hash)).to.be(exp);
                });
            });
        }

        it('throws error if hmac-sha256 is not implemented', function() {
            useNoImpl();
            return CryptoEngine.hmacSha256(fromHex(key), fromHex(data))
                .then(function() { throw 'No error generated'; })
                .catch(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: HMAC-SHA256 not implemented'); });
        });
    });

    describe('random', function() {
        it('fills random bytes', function() {
            useDefaultImpl();
            var rand1 = CryptoEngine.random(20);
            expect(rand1.length).to.be(20);
            var rand2 = CryptoEngine.random(20);
            expect(rand2.length).to.be(20);
            expect(ByteUtils.arrayBufferEquals(rand1, rand2)).to.be(false);
            var rand3 = CryptoEngine.random(10);
            expect(rand3.length).to.be(10);
        });

        it('can fill more than 65536 bytes', function() {
            useDefaultImpl();
            var rand1 = CryptoEngine.random(77111);
            expect(rand1.length).to.be(77111);
        });

        if (SubtleMockNode) {
            it('generates random bytes with subtle', function() {
                useSubtleMock();
                var rand1 = CryptoEngine.random(20);
                expect(rand1.length).to.be(20);
            });
        }

        it('throws error if random is not implemented', function() {
            useNoImpl();
            expect(function() { CryptoEngine.random(20); })
                .to.throwException(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: Random not implemented'); });
        });
    });

    describe('AesCbc', function() {
        var key = '6b2796fa863a6552986c428528d053b76de7ba8e12f8c0e74edb5ed44da3f601';
        var data = 'e567554429098a38d5f819115edffd39';
        var iv = '4db46dff4add42cb813b98de98e627c4';
        var exp = '46ab4c37d9ec594e5742971f76f7c1620bc29f2e0736b27832d6bcc5c1c39dc1';

        it('encrypts-decrypts with aes-cbc', function() {
            useDefaultImpl();
            var aes = CryptoEngine.createAesCbc();
            return aes.importKey(fromHex(key)).then(function() {
                return aes.encrypt(fromHex(data), fromHex(iv)).then(function(result) {
                    expect(toHex(result)).to.be(exp);
                    return aes.decrypt(result, fromHex(iv)).then(function(result) {
                        expect(toHex(result)).to.be(data);
                    });
                });
            });
        });

        it('throws error or generates wrong data for bad key', function() {
            useDefaultImpl();
            var aes = CryptoEngine.createAesCbc();
            return aes.importKey(fromHex(key)).then(function() {
                return aes.decrypt(fromHex(data), fromHex(iv)).then(function(result) {
                    expect(toHex(result)).not.to.be(data);
                })
                .catch(function (e) {
                    expect(e.message).to.contain('Error InvalidKey: ');
                });
            });
        });

        if (SubtleMockNode) {
            it('encrypts-decrypts with aes-cbc with subtle', function() {
                useSubtleMock();
                var aes = CryptoEngine.createAesCbc();
                return aes.importKey(fromHex(key)).then(function() {
                    return aes.encrypt(fromHex(data), fromHex(iv)).then(function(result) {
                        expect(toHex(result)).to.be(exp);
                        return aes.decrypt(result, fromHex(iv)).then(function(result) {
                            expect(toHex(result)).to.be(data);
                        });
                    });
                });
            });

            it('throws error for bad key', function() {
                useSubtleMock();
                var aes = CryptoEngine.createAesCbc();
                return aes.importKey(fromHex(key)).then(function() {
                    return aes.decrypt(data, fromHex(iv)).then(function(result) {
                        expect(toHex(result)).to.be(data);
                    })
                    .then(function () {
                        throw 'Not expected';
                    })
                    .catch(function (e) {
                        expect(e.message).to.contain('Error InvalidKey: ');
                    });
                });
            });
        }

        it('throws error if aes-cbc is not implemented', function() {
            useNoImpl();
            expect(function() { CryptoEngine.createAesCbc(); })
                .to.throwException(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: AES-CBC not implemented'); });
        });
    });

    describe('chacha20', function() {
        var key = '6b2796fa863a6552986c428528d053b76de7ba8e12f8c0e74edb5ed44da3f601';
        var data = 'e567554429098a38d5f819115edffd39';
        var iv12 = '4db46dff4add42cb813b98de';
        var exp12 = 'd0b413d0e71dd55db9ce29ed092724d1';
        var iv8 = '4db46dff4add42cb';
        var exp8 = 'ebaee4b6790192fd6e60f6294ea12c98';

        it('encrypts with chacha20', function() {
            useDefaultImpl();
            return CryptoEngine.chacha20(ByteUtils.hexToBytes(data), ByteUtils.hexToBytes(key), ByteUtils.hexToBytes(iv12))
                .then(function(result) {
                    expect(toHex(result)).to.be(exp12);
                });
        });

        it('encrypts with short iv', function() {
            useDefaultImpl();
            return CryptoEngine.chacha20(ByteUtils.hexToBytes(data), ByteUtils.hexToBytes(key), ByteUtils.hexToBytes(iv8))
                .then(function(result) {
                    expect(toHex(result)).to.be(exp8);
                });
        });
    });

    describe('argon2', function() {
        it('throws error if argon2 is not implemented', function() {
            useDefaultImpl();
            return CryptoEngine.argon2()
                .then(function() { throw 'No error generated'; })
                .catch(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: Argon2 not implemented'); });
        });
    });
});
