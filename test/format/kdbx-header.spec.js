'use strict';

var expect = require('expect.js'),
    Consts = require('../../lib/defs/consts'),
    BinaryStream = require('../../lib/utils/binary-stream'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    VarDictionary = require('../../lib/utils/var-dictionary'),
    ProtectedValue = require('../../lib/crypto/protected-value'),
    KdbxContext = require('../../lib/format/kdbx-context'),
    KdbxError = require('../../lib/errors/kdbx-error'),
    KdbxUuid = require('../../lib/format/kdbx-uuid'),
    KdbxHeader = require('../../lib/format/kdbx-header');

describe('KdbxHeader', function() {
    it('writes and reads header v3', function() {
        var ctx = new KdbxContext({ kdbx: { } });
        var header = KdbxHeader.create();
        expect(header.versionMajor).to.be(3);
        header.masterSeed = new Uint32Array([1,1,1,1]).buffer;
        header.transformSeed = new Uint32Array([2,2,2,2]).buffer;
        header.streamStartBytes = new Uint32Array([3,3,3,3]).buffer;
        header.protectedStreamKey = new Uint32Array([4,4,4,4]).buffer;
        header.encryptionIV = new Uint32Array([5,5]).buffer;

        var headerStm = new BinaryStream();
        header.write(headerStm);
        var newHeader = KdbxHeader.read(new BinaryStream(headerStm.getWrittenBytes()), ctx);

        expect(newHeader.versionMajor).to.be(header.versionMajor);
        expect(newHeader.versionMinor).to.be(header.versionMinor);
        expect(newHeader.dataCipherUuid.toString()).to.be(Consts.CipherId.Aes);
        expect(newHeader.crsAlgorithm).to.be(Consts.CrsAlgorithm.Salsa20);
        expect(newHeader.compression).to.be(Consts.CompressionAlgorithm.GZip);
        expect(newHeader.endPos).to.be(headerStm.getWrittenBytes().byteLength);
        expect(ByteUtils.bytesToHex(newHeader.masterSeed)).to.be('01000000010000000100000001000000');
        expect(ByteUtils.bytesToHex(newHeader.transformSeed)).to.be('02000000020000000200000002000000');
        expect(ByteUtils.bytesToHex(newHeader.streamStartBytes)).to.be('03000000030000000300000003000000');
        expect(ByteUtils.bytesToHex(newHeader.protectedStreamKey)).to.be('04000000040000000400000004000000');
        expect(ByteUtils.bytesToHex(newHeader.encryptionIV)).to.be('0500000005000000');
        expect(newHeader.kdfParameters).to.be(undefined);
        expect(newHeader.publicCustomData).to.be(undefined);
    });

    it('writes and reads header v4', function() {
        var kdbx = {
            binaries: {
                0: new Uint8Array([1, 2]).buffer,
                1: ProtectedValue.fromBinary(new Uint8Array([1, 2, 3]).buffer),
                hashOrder: ['0', '1']
            }
        };
        var header = KdbxHeader.create();
        expect(header.versionMajor).to.be(3);
        header.upgrade();
        header.masterSeed = new Uint32Array([1,1,1,1]).buffer;
        header.transformSeed = new Uint32Array([2,2,2,2]).buffer;
        header.streamStartBytes = new Uint32Array([3,3,3,3]).buffer;
        header.protectedStreamKey = new Uint32Array([4,4,4,4]).buffer;
        header.encryptionIV = new Uint32Array([5,5]).buffer;
        header.kdfParameters.set('S', VarDictionary.ValueType.Bytes, new Uint32Array([6,6,6,6]).buffer);
        header.publicCustomData = new VarDictionary();
        header.publicCustomData.set('custom', VarDictionary.ValueType.String, 'val');

        var headerStm = new BinaryStream();
        var innerHeaderStm = new BinaryStream();
        header.write(headerStm);
        header.writeInnerHeader(innerHeaderStm, new KdbxContext({ kdbx: kdbx }));
        var newKdbx = { binaries: {} };
        var newHeader = KdbxHeader.read(new BinaryStream(headerStm.getWrittenBytes()), new KdbxContext({ kdbx: newKdbx }));

        expect(newHeader.versionMajor).to.be(header.versionMajor);
        expect(newHeader.versionMinor).to.be(header.versionMinor);
        expect(newHeader.dataCipherUuid.toString()).to.be(Consts.CipherId.Aes);
        expect(newHeader.crsAlgorithm).to.be(undefined);
        expect(newHeader.compression).to.be(Consts.CompressionAlgorithm.GZip);
        expect(newHeader.endPos).to.be(headerStm.getWrittenBytes().byteLength);
        expect(ByteUtils.bytesToHex(newHeader.masterSeed)).to.be('01000000010000000100000001000000');
        expect(newHeader.transformSeed).to.be(undefined);
        expect(newHeader.streamStartBytes).to.be(undefined);
        expect(newHeader.protectedStreamKey).to.be(undefined);
        expect(ByteUtils.bytesToHex(newHeader.encryptionIV)).to.be('0500000005000000');
        expect(newHeader.kdfParameters.length).to.be(6);
        expect(ByteUtils.bytesToBase64(newHeader.kdfParameters.get('$UUID'))).to.be(Consts.KdfId.Argon2);
        expect(ByteUtils.bytesToHex(newHeader.kdfParameters.get('S'))).to.be('06000000060000000600000006000000');
        expect(newHeader.kdfParameters.get('P')).to.be(1);
        expect(newHeader.kdfParameters.get('V')).to.be(0x13);
        expect(newHeader.kdfParameters.get('I').value).to.be(2);
        expect(newHeader.kdfParameters.get('M').value).to.be(1024 * 1024);
        expect(newHeader.publicCustomData.length).to.be(1);
        expect(newHeader.publicCustomData.get('custom')).to.be('val');
        expect(newKdbx.binaries).to.eql({});

        newHeader.readInnerHeader(new BinaryStream(innerHeaderStm.getWrittenBytes()), new KdbxContext({ kdbx: newKdbx }));

        expect(newHeader.crsAlgorithm).to.be(Consts.CrsAlgorithm.ChaCha20);
        expect(ByteUtils.bytesToHex(newHeader.protectedStreamKey)).to.be('04000000040000000400000004000000');
        expect(Object.keys(newKdbx.binaries)).to.eql(['0', '1']);
        expect(newKdbx.binaries[0]).to.be.an(ArrayBuffer);
        expect(ByteUtils.bytesToHex(newKdbx.binaries[0])).to.be(ByteUtils.bytesToHex(kdbx.binaries[0]));
        expect(newKdbx.binaries[1]).to.be.a(ProtectedValue);
        expect(ByteUtils.bytesToHex(newKdbx.binaries[1].getBinary())).to.be(ByteUtils.bytesToHex(kdbx.binaries[1].getBinary()));
    });

    it('generates salts v3', function() {
        var header = new KdbxHeader();
        header.versionMajor = 3;
        header.generateSalts();

        expect(header.masterSeed).to.be.ok();
        expect(header.masterSeed.length).to.be(32);
        expect(header.transformSeed).to.be.ok();
        expect(header.transformSeed.length).to.be(32);
        expect(header.streamStartBytes).to.be.ok();
        expect(header.streamStartBytes.length).to.be(32);
        expect(header.protectedStreamKey).to.be.ok();
        expect(header.protectedStreamKey.length).to.be(32);
        expect(header.encryptionIV).to.be.ok();
        expect(header.encryptionIV.length).to.be(16);
    });

    it('generates salts v4', function() {
        var header = new KdbxHeader();
        header.versionMajor = 4;
        header.dataCipherUuid = new KdbxUuid(Consts.CipherId.ChaCha20);
        header.kdfParameters = new VarDictionary();
        header.generateSalts();

        expect(header.protectedStreamKey).to.be.ok();
        expect(header.protectedStreamKey.length).to.be(64);
        expect(header.kdfParameters.get('S')).to.be.ok();
        expect(header.kdfParameters.get('S').byteLength).to.be(32);
        expect(header.encryptionIV).to.be.ok();
        expect(header.encryptionIV.length).to.be(12);

        header.dataCipherUuid = new KdbxUuid(Consts.CipherId.Aes);
        header.generateSalts();
        expect(header.encryptionIV.length).to.be(16);
    });

    it('throws error for bad binary', function() {
        var ctx = new KdbxContext({ kdbx: { binaries: { 0: undefined, hashOrder: ['0'] } } });
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        expect(function () {
            header.writeInnerHeader(new BinaryStream(), ctx);
        }).to.throwException(function(e) {
            expect(e).to.be.a(KdbxError);
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no binary 0');
        });
    });

    it('skips binaries for v3', function() {
        var ctx = new KdbxContext({ kdbx: { binaries: { 0: undefined } } });
        var header = KdbxHeader.create();
        var stm = new BinaryStream();
        header._writeBinary(stm, ctx);
        expect(stm.pos).to.be(0);
    });

    it('writes header without public custom data', function() {
        var ctx = new KdbxContext({ kdbx: { binaries: { hashOrder: [] } } });
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        var stm = new BinaryStream();
        header.write(stm);
        header.writeInnerHeader(stm, ctx);

        stm = new BinaryStream(stm.getWrittenBytes());
        var newHeader = KdbxHeader.read(stm, ctx);
        newHeader.readInnerHeader(stm, ctx);
        expect(newHeader.publicCustomData).to.be(undefined);
    });

    it('validates header cipher', function() {
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        header.dataCipherUuid = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no cipher in header');
        });
    });

    it('validates header cipher', function() {
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        header.compression = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no compression in header');
        });
    });

    it('validates master seed cipher', function() {
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        header.masterSeed = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no master seed in header');
        });
    });

    it('validates header encryption iv', function() {
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        header.encryptionIV = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no encryption iv in header');
        });
    });

    it('validates header kdf parameters', function() {
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        header.kdfParameters = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no kdf parameters in header');
        });
    });

    it('validates header transform seed', function() {
        var header = KdbxHeader.create();
        header.generateSalts();
        header.transformSeed = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no transform seed in header');
        });
    });

    it('validates header key encryption rounds', function() {
        var header = KdbxHeader.create();
        header.generateSalts();
        header.keyEncryptionRounds = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no key encryption rounds in header');
        });
    });

    it('validates header protected stream key', function() {
        var header = KdbxHeader.create();
        header.generateSalts();
        header.protectedStreamKey = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no protected stream key in header');
        });
    });

    it('validates header stream start bytes', function() {
        var header = KdbxHeader.create();
        header.generateSalts();
        header.streamStartBytes = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no stream start bytes in header');
        });
    });

    it('validates header crs algorithm', function() {
        var header = KdbxHeader.create();
        header.generateSalts();
        header.crsAlgorithm = undefined;
        expect(function() { header.write(new BinaryStream()); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no crs algorithm in header');
        });
    });

    it('validates inner header protected straem key', function() {
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        header.protectedStreamKey = undefined;
        expect(function() { header.writeInnerHeader(new BinaryStream(), new KdbxContext({})); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no protected stream key in header');
        });
    });

    it('validates inner header crs algorithm', function() {
        var header = KdbxHeader.create();
        header.upgrade();
        header.generateSalts();
        header.crsAlgorithm = undefined;
        expect(function() { header.writeInnerHeader(new BinaryStream(), new KdbxContext({})); }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no crs algorithm in header');
        });
    });

    it('throws error for bad signature', function() {
        expect(function() {
            KdbxHeader.read(new BinaryStream(ByteUtils.hexToBytes('0000000000000000').buffer), new KdbxContext({}));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.BadSignature);
        });
    });

    it('throws error for bad version', function() {
        expect(function() {
            KdbxHeader.read(new BinaryStream(ByteUtils.hexToBytes('03d9a29a67fb4bb501000500').buffer), new KdbxContext({}));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidVersion);
        });
    });

    it('throws error for bad cipher', function() {
        expect(function() {
            KdbxHeader.read(new BinaryStream(ByteUtils.hexToBytes('03d9a29a67fb4bb501000400020100000031c1f2e6bf').buffer),
                new KdbxContext({}));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.Unsupported);
            expect(e.message).to.contain('cipher');
        });
    });

    it('throws error for bad compression flags', function() {
        expect(function() {
            KdbxHeader.read(new BinaryStream(ByteUtils.hexToBytes('03d9a29a67fb4bb5010004000320000000011111111').buffer),
                new KdbxContext({}));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.Unsupported);
            expect(e.message).to.contain('compression');
        });
    });

    it('throws error for empty files', function() {
        expect(function() {
            KdbxHeader.read(new BinaryStream(new ArrayBuffer(0)), new KdbxContext({}));
        }).to.throwException(function(e) {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('not enough data');
        });
    });
});
