import expect from 'expect.js';
import {
    BinaryStream,
    ByteUtils,
    Consts,
    Int64,
    Kdbx,
    KdbxBinaries,
    KdbxContext,
    KdbxHeader,
    KdbxUuid,
    ProtectedValue,
    VarDictionary
} from '../../lib';
import { ValueType } from '../../lib/utils/var-dictionary';

describe('KdbxHeader', () => {
    const kdbx = new Kdbx();

    it('writes and reads header v3', () => {
        const ctx = new KdbxContext({ kdbx });
        const header = KdbxHeader.create();
        expect(header.versionMajor).to.be(4);
        header.setVersion(3);
        expect(header.versionMajor).to.be(3);
        header.masterSeed = new Uint32Array([1, 1, 1, 1]).buffer;
        header.transformSeed = new Uint32Array([2, 2, 2, 2]).buffer;
        header.streamStartBytes = new Uint32Array([3, 3, 3, 3]).buffer;
        header.protectedStreamKey = new Uint32Array([4, 4, 4, 4]).buffer;
        header.encryptionIV = new Uint32Array([5, 5]).buffer;

        const headerStm = new BinaryStream();
        header.write(headerStm);
        const newHeader = KdbxHeader.read(new BinaryStream(headerStm.getWrittenBytes()), ctx);

        expect(newHeader.versionMajor).to.be(header.versionMajor);
        expect(newHeader.versionMinor).to.be(header.versionMinor);
        expect(newHeader.dataCipherUuid!.toString()).to.be(Consts.CipherId.Aes);
        expect(newHeader.crsAlgorithm).to.be(Consts.CrsAlgorithm.Salsa20);
        expect(newHeader.compression).to.be(Consts.CompressionAlgorithm.GZip);
        expect(newHeader.endPos).to.be(headerStm.getWrittenBytes().byteLength);
        expect(ByteUtils.bytesToHex(newHeader.masterSeed!)).to.be(
            '01000000010000000100000001000000'
        );
        expect(ByteUtils.bytesToHex(newHeader.transformSeed!)).to.be(
            '02000000020000000200000002000000'
        );
        expect(ByteUtils.bytesToHex(newHeader.streamStartBytes!)).to.be(
            '03000000030000000300000003000000'
        );
        expect(ByteUtils.bytesToHex(newHeader.protectedStreamKey!)).to.be(
            '04000000040000000400000004000000'
        );
        expect(ByteUtils.bytesToHex(newHeader.encryptionIV!)).to.be('0500000005000000');
        expect(newHeader.kdfParameters).to.be(undefined);
        expect(newHeader.publicCustomData).to.be(undefined);
    });

    it('writes and reads header v4', async () => {
        const kdbx = new Kdbx();
        kdbx.binaries = new KdbxBinaries();
        kdbx.binaries.addWithNextId(new Uint8Array([1, 2]));
        kdbx.binaries.addWithNextId(ProtectedValue.fromBinary(new Uint8Array([1, 2, 3]).buffer));
        await kdbx.binaries.computeHashes();

        const header = KdbxHeader.create();
        expect(header.versionMajor).to.be(4);
        header.masterSeed = new Uint32Array([1, 1, 1, 1]).buffer;
        header.transformSeed = new Uint32Array([2, 2, 2, 2]).buffer;
        header.streamStartBytes = new Uint32Array([3, 3, 3, 3]).buffer;
        header.protectedStreamKey = new Uint32Array([4, 4, 4, 4]).buffer;
        header.encryptionIV = new Uint32Array([5, 5]).buffer;
        header.kdfParameters!.set('S', ValueType.Bytes, new Uint32Array([6, 6, 6, 6]).buffer);
        header.publicCustomData = new VarDictionary();
        header.publicCustomData.set('custom', ValueType.String, 'val');

        const headerStm = new BinaryStream();
        const innerHeaderStm = new BinaryStream();
        header.write(headerStm);
        header.writeInnerHeader(innerHeaderStm, new KdbxContext({ kdbx }));

        const newKdbx = new Kdbx();
        newKdbx.binaries = new KdbxBinaries();
        const newHeader = KdbxHeader.read(
            new BinaryStream(headerStm.getWrittenBytes()),
            new KdbxContext({ kdbx: newKdbx })
        );

        expect(newHeader.versionMajor).to.be(header.versionMajor);
        expect(newHeader.versionMinor).to.be(header.versionMinor);
        expect(newHeader.dataCipherUuid!.toString()).to.be(Consts.CipherId.Aes);
        expect(newHeader.crsAlgorithm).to.be(undefined);
        expect(newHeader.compression).to.be(Consts.CompressionAlgorithm.GZip);
        expect(newHeader.endPos).to.be(headerStm.getWrittenBytes().byteLength);
        expect(ByteUtils.bytesToHex(newHeader.masterSeed!)).to.be(
            '01000000010000000100000001000000'
        );
        expect(newHeader.transformSeed).to.be(undefined);
        expect(newHeader.streamStartBytes).to.be(undefined);
        expect(newHeader.protectedStreamKey).to.be(undefined);
        expect(ByteUtils.bytesToHex(newHeader.encryptionIV!)).to.be('0500000005000000');
        expect(newHeader.kdfParameters!.length).to.be(6);
        expect(ByteUtils.bytesToBase64(newHeader.kdfParameters!.get('$UUID') as ArrayBuffer)).to.be(
            Consts.KdfId.Argon2
        );
        expect(ByteUtils.bytesToHex(newHeader.kdfParameters!.get('S') as ArrayBuffer)).to.be(
            '06000000060000000600000006000000'
        );
        expect(newHeader.kdfParameters!.get('P')).to.be(1);
        expect(newHeader.kdfParameters!.get('V')).to.be(0x13);
        expect((newHeader.kdfParameters!.get('I') as Int64).value).to.be(2);
        expect((newHeader.kdfParameters!.get('M') as Int64).value).to.be(1024 * 1024);
        expect(newHeader.publicCustomData!.length).to.be(1);
        expect(newHeader.publicCustomData!.get('custom')).to.be('val');
        expect(newKdbx.binaries.getAll()).to.eql([]);

        newHeader.readInnerHeader(
            new BinaryStream(innerHeaderStm.getWrittenBytes()),
            new KdbxContext({ kdbx: newKdbx })
        );

        await newKdbx.binaries.computeHashes();

        expect(newHeader.crsAlgorithm).to.be(Consts.CrsAlgorithm.ChaCha20);
        expect(ByteUtils.bytesToHex(newHeader.protectedStreamKey!)).to.be(
            '04000000040000000400000004000000'
        );

        const oldBinaries = kdbx.binaries.getAll();
        const newBinaries = newKdbx.binaries.getAll();
        expect(newBinaries.length).to.eql(2);
        expect(newBinaries[0].ref).to.eql('0');
        expect(newBinaries[0].value).to.be.an(ArrayBuffer);
        expect(ByteUtils.bytesToHex(newBinaries[0].value as ArrayBuffer)).to.be(
            ByteUtils.bytesToHex(oldBinaries[0].value as ArrayBuffer)
        );
        expect(newBinaries[1].ref).to.eql('1');
        expect(newBinaries[1].value).to.be.a(ProtectedValue);
        expect(ByteUtils.bytesToHex((newBinaries[1].value as ProtectedValue).getBinary())).to.be(
            ByteUtils.bytesToHex((oldBinaries[1].value as ProtectedValue).getBinary())
        );
    });

    it('generates salts v3', () => {
        const header = new KdbxHeader();
        header.versionMajor = 3;
        header.generateSalts();

        expect(header.masterSeed).to.be.ok();
        expect(header.masterSeed!.byteLength).to.be(32);
        expect(header.transformSeed).to.be.ok();
        expect(header.transformSeed!.byteLength).to.be(32);
        expect(header.streamStartBytes).to.be.ok();
        expect(header.streamStartBytes!.byteLength).to.be(32);
        expect(header.protectedStreamKey).to.be.ok();
        expect(header.protectedStreamKey!.byteLength).to.be(32);
        expect(header.encryptionIV).to.be.ok();
        expect(header.encryptionIV!.byteLength).to.be(16);
    });

    it('generates salts v4', () => {
        const header = new KdbxHeader();
        header.versionMajor = 4;
        header.dataCipherUuid = new KdbxUuid(Consts.CipherId.ChaCha20);
        header.kdfParameters = new VarDictionary();
        header.generateSalts();

        expect(header.protectedStreamKey).to.be.ok();
        expect(header.protectedStreamKey!.byteLength).to.be(64);
        expect(header.kdfParameters.get('S')).to.be.ok();
        expect((header.kdfParameters.get('S') as ArrayBuffer).byteLength).to.be(32);
        expect(header.encryptionIV).to.be.ok();
        expect(header.encryptionIV!.byteLength).to.be(12);

        header.dataCipherUuid = new KdbxUuid(Consts.CipherId.Aes);
        header.generateSalts();
        expect(header.encryptionIV!.byteLength).to.be(16);
    });

    it('skips binaries for v3', async () => {
        const kdbx = new Kdbx();
        await kdbx.binaries.add(new Uint8Array([1]));
        await kdbx.binaries.computeHashes();
        const ctx = new KdbxContext({ kdbx });
        const header = KdbxHeader.create();
        header.setVersion(3);
        const stm = new BinaryStream();
        // @ts-ignore
        header.writeBinary(stm, ctx);
        expect(stm.pos).to.be(0);
    });

    it('writes header without public custom data', async () => {
        const kdbx = new Kdbx();
        await kdbx.binaries.add(new Uint8Array([1]));
        await kdbx.binaries.computeHashes();
        const ctx = new KdbxContext({ kdbx });
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        let stm = new BinaryStream();
        header.write(stm);
        header.writeInnerHeader(stm, ctx);

        stm = new BinaryStream(stm.getWrittenBytes());
        const newHeader = KdbxHeader.read(stm, ctx);
        newHeader.readInnerHeader(stm, ctx);
        expect(newHeader.publicCustomData).to.be(undefined);
    });

    it('validates header cipher', () => {
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        header.dataCipherUuid = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no cipher in header');
        });
    });

    it('validates header cipher', () => {
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        header.compression = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no compression in header');
        });
    });

    it('validates master seed cipher', () => {
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        header.masterSeed = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no master seed in header');
        });
    });

    it('validates header encryption iv', () => {
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        header.encryptionIV = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no encryption iv in header');
        });
    });

    it('validates header kdf parameters', () => {
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        header.kdfParameters = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no kdf parameters in header');
        });
    });

    it('validates header transform seed', () => {
        const header = KdbxHeader.create();
        header.setVersion(3);
        header.generateSalts();
        header.transformSeed = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no transform seed in header');
        });
    });

    it('validates header key encryption rounds', () => {
        const header = KdbxHeader.create();
        header.setVersion(3);
        header.generateSalts();
        header.keyEncryptionRounds = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no key encryption rounds in header');
        });
    });

    it('validates header protected stream key', () => {
        const header = KdbxHeader.create();
        header.setVersion(3);
        header.generateSalts();
        header.protectedStreamKey = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no protected stream key in header');
        });
    });

    it('validates header stream start bytes', () => {
        const header = KdbxHeader.create();
        header.setVersion(3);
        header.generateSalts();
        header.streamStartBytes = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no stream start bytes in header');
        });
    });

    it('validates header crs algorithm', () => {
        const header = KdbxHeader.create();
        header.setVersion(3);
        header.generateSalts();
        header.crsAlgorithm = undefined;
        expect(() => {
            header.write(new BinaryStream());
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no crs algorithm in header');
        });
    });

    it('validates inner header protected straem key', () => {
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        header.protectedStreamKey = undefined;
        expect(() => {
            header.writeInnerHeader(new BinaryStream(), new KdbxContext({ kdbx }));
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no protected stream key in header');
        });
    });

    it('validates inner header crs algorithm', () => {
        const header = KdbxHeader.create();
        header.setVersion(KdbxHeader.MaxFileVersion);
        header.generateSalts();
        header.crsAlgorithm = undefined;
        expect(() => {
            header.writeInnerHeader(new BinaryStream(), new KdbxContext({ kdbx }));
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('no crs algorithm in header');
        });
    });

    it('throws error for bad signature', () => {
        expect(() => {
            KdbxHeader.read(
                new BinaryStream(ByteUtils.hexToBytes('0000000000000000').buffer),
                new KdbxContext({ kdbx })
            );
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.BadSignature);
        });
    });

    it('throws error for bad version', () => {
        expect(() => {
            KdbxHeader.read(
                new BinaryStream(ByteUtils.hexToBytes('03d9a29a67fb4bb501000500').buffer),
                new KdbxContext({ kdbx })
            );
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidVersion);
        });
    });

    it('throws error for bad cipher', () => {
        expect(() => {
            KdbxHeader.read(
                new BinaryStream(
                    ByteUtils.hexToBytes('03d9a29a67fb4bb501000400020100000031c1f2e6bf').buffer
                ),
                new KdbxContext({ kdbx })
            );
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.Unsupported);
            expect(e.message).to.contain('cipher');
        });
    });

    it('throws error for bad compression flags', () => {
        expect(() => {
            KdbxHeader.read(
                new BinaryStream(
                    ByteUtils.hexToBytes('03d9a29a67fb4bb5010004000320000000011111111').buffer
                ),
                new KdbxContext({ kdbx })
            );
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.Unsupported);
            expect(e.message).to.contain('compression');
        });
    });

    it('throws error for empty files', () => {
        expect(() => {
            KdbxHeader.read(new BinaryStream(new ArrayBuffer(0)), new KdbxContext({ kdbx }));
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
            expect(e.message).to.contain('not enough data');
        });
    });

    it('throws error for bad version in setVersion', () => {
        const header = KdbxHeader.create();
        expect(() => {
            header.setVersion(2);
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });

    it('throws error for bad KDF in setKdf', () => {
        const header = KdbxHeader.create();
        expect(() => {
            header.setKdf('unknown');
        }).to.throwException((e) => {
            expect(e.code).to.be(Consts.ErrorCodes.InvalidArg);
        });
    });
});
