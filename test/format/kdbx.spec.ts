import expect from 'expect.js';
import * as kdbxweb from '../../lib';
import { argon2 } from '../test-support/argon2';
import { TestResources } from '../test-support/test-resources';
import { KdbxChallengeResponseFn } from '../../lib/format/kdbx-credentials';
import { KdbxBinaryWithHash } from '../../lib/format/kdbx-binaries';

describe('Kdbx', () => {
    const cryptoEngineArgon2 = kdbxweb.CryptoEngine.argon2;
    const challengeResponse: KdbxChallengeResponseFn = function (challenge) {
        const responses = new Map<string, string>([
            [
                '011ed85afa703341893596fba2da60b6cacabaa5468a0e9ea74698b901bc89ab',
                'ae7244b336f3360e4669ec9eaf4ddc23785aef03'
            ],
            [
                '0ba4bbdf2e44fe56b64136a5086ba3ab814130d8e3fe7ed0e869cc976af6c12a',
                '18350f73193e1c89211921d3016bfe3ddfc54d3e'
            ]
        ]);
        const hexChallenge = kdbxweb.ByteUtils.bytesToHex(challenge);
        const response = responses.get(hexChallenge) || '0000000000000000000000000000000000000000';
        return Promise.resolve(kdbxweb.ByteUtils.hexToBytes(response));
    };

    before(() => {
        kdbxweb.CryptoEngine.argon2 = argon2;
    });

    after(() => {
        kdbxweb.CryptoEngine.argon2 = cryptoEngineArgon2;
    });

    it('loads simple file', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.meta.generator).to.be('KeePass');
            checkDb(db);
        });
    });

    it('loads simple xml file', () => {
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
        const xml = kdbxweb.ByteUtils.bytesToString(TestResources.demoXml).toString();
        return kdbxweb.Kdbx.loadXml(xml, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.meta.generator).to.be('KeePass');
            checkDb(db);
        });
    });

    it('generates error for malformed xml file', () => {
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
        return kdbxweb.Kdbx.loadXml('malformed-xml', cred)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
    });

    it('loads utf8 uncompressed file', () => {
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('пароль'));
        return kdbxweb.Kdbx.load(TestResources.cyrillicKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with binary key', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('test'),
            TestResources.binKeyKey
        );
        return kdbxweb.Kdbx.load(TestResources.binKeyKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with empty pass', () => {
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
        return kdbxweb.Kdbx.load(TestResources.emptyPass, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with empty pass and keyfile', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString(''),
            TestResources.emptyPassWithKeyFileKey
        );
        return kdbxweb.Kdbx.load(TestResources.emptyPassWithKeyFile, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with no pass and keyfile', () => {
        const cred = new kdbxweb.Credentials(null, TestResources.noPassWithKeyFileKey);
        return kdbxweb.Kdbx.load(TestResources.noPassWithKeyFile, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a 32-byte keyfile', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('test'),
            TestResources.key32KeyFile
        );
        return kdbxweb.Kdbx.load(TestResources.key32, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a 64-byte keyfile', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('test'),
            TestResources.key64KeyFile
        );
        return kdbxweb.Kdbx.load(TestResources.key64, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a xml-bom keyfile', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('test'),
            TestResources.keyWithBomKeyFile
        );
        return kdbxweb.Kdbx.load(TestResources.keyWithBom, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a V2 keyfile', () => {
        const cred = new kdbxweb.Credentials(null, TestResources.keyV2KeyFile);
        return kdbxweb.Kdbx.load(TestResources.keyV2, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('generates error for bad keyfile version', () => {
        const cred = new kdbxweb.Credentials(null, TestResources.badVersionKeyFile);
        return kdbxweb.Kdbx.load(TestResources.keyV2, cred)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('Bad keyfile version');
            });
    });

    it('generates error for keyfile hash mismatch', () => {
        const cred = new kdbxweb.Credentials(null, TestResources.badHashV2KeyFile);
        return kdbxweb.Kdbx.load(TestResources.keyV2, cred)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('Key file data hash mismatch');
            });
    });

    it('successfully loads saved file', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx4 file with argon2 kdf', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.argon2, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx4 file with argon2id kdf', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.argon2id, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx3 file with chacha20', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.aesChaCha, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.header.dataCipherUuid!.toString()).to.be(kdbxweb.Consts.CipherId.ChaCha20);
            checkDb(db);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    expect(db.header.dataCipherUuid!.toString()).to.be(
                        kdbxweb.Consts.CipherId.ChaCha20
                    );
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx4 file with aes kdf', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'));
        return kdbxweb.Kdbx.load(TestResources.aesKdfKdbx4, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.header.dataCipherUuid!.toString()).to.be(kdbxweb.Consts.CipherId.Aes);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    expect(db.header.dataCipherUuid!.toString()).to.be(kdbxweb.Consts.CipherId.Aes);
                });
            });
        });
    });

    it('loads kdbx4 file with argon2 kdf and chacha20 encryption', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.argon2ChaCha, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx3 file with challenge-response', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            null,
            challengeResponse
        );
        return kdbxweb.Kdbx.load(TestResources.yubikey3, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.meta.generator).to.be('Strongbox');
        });
    });

    it('loads a kdbx4 file with challenge-response', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            null,
            challengeResponse
        );
        return kdbxweb.Kdbx.load(TestResources.yubikey4, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.meta.generator).to.be('KeePassXC');
        });
    });

    it('upgrades file to latest version', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.header.versionMajor).to.be(4);
                    expect(
                        kdbxweb.ByteUtils.bytesToBase64(
                            db.header.kdfParameters!.get('$UUID') as ArrayBuffer
                        )
                    ).to.be(kdbxweb.Consts.KdfId.Argon2);
                    checkDb(db);
                });
            });
        });
    });

    it('upgrades file to V4 with aes kdf', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            db.setKdf(kdbxweb.Consts.KdfId.Aes);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.header.versionMajor).to.be(4);
                    expect(
                        kdbxweb.ByteUtils.bytesToBase64(
                            db.header.kdfParameters!.get('$UUID') as ArrayBuffer
                        )
                    ).to.be(kdbxweb.Consts.KdfId.Aes);
                    checkDb(db);
                });
            });
        });
    });

    it('upgrades file to V4 with argon2id kdf', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            db.setKdf(kdbxweb.Consts.KdfId.Argon2id);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.header.versionMajor).to.be(4);
                    expect(
                        kdbxweb.ByteUtils.bytesToBase64(
                            db.header.kdfParameters!.get('$UUID') as ArrayBuffer
                        )
                    ).to.be(kdbxweb.Consts.KdfId.Argon2id);
                    checkDb(db);
                });
            });
        });
    });

    it('downgrades file to V3', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.setVersion(3);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.header.versionMajor).to.be(3);
                    checkDb(db);
                });
            });
        });
    });

    it('saves kdbx4 to xml and loads it back', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            return db.saveXml().then((xml) => {
                return kdbxweb.Kdbx.loadXml(xml, cred).then((db) => {
                    checkDb(db);
                });
            });
        });
    });

    it('saves and loads custom data', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            const iconId = kdbxweb.KdbxUuid.random();
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            db.getDefaultGroup().groups[0].customData = new Map([['custom', 'group']]);
            db.getDefaultGroup().groups[0].customIcon = iconId;
            db.getDefaultGroup().entries[0].customData = new Map([['custom', 'entry']]);
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.header.versionMajor).to.be(4);
                    expect([...db.getDefaultGroup().groups[0].customData!]).to.eql([
                        ['custom', 'group']
                    ]);
                    expect(db.getDefaultGroup().groups[0].customIcon!.toString()).to.eql(
                        iconId.toString()
                    );
                    expect([...db.getDefaultGroup().entries[0].customData!]).to.eql([
                        ['custom', 'entry']
                    ]);
                    checkDb(db);
                });
            });
        });
    });

    it('creates new database', () => {
        return kdbxweb.Credentials.createRandomKeyFile(1).then((keyFile) => {
            const cred = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString('demo'),
                keyFile
            );
            const db = kdbxweb.Kdbx.create(cred, 'example');
            const subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
            const entry = db.createEntry(subGroup);
            db.meta.customData.set('key', 'val');
            db.createDefaultGroup();
            db.createRecycleBin();
            entry.fields.set('Title', 'title');
            entry.fields.set('UserName', 'user');
            entry.fields.set('Password', kdbxweb.ProtectedValue.fromString('pass'));
            entry.fields.set('Notes', 'notes');
            entry.fields.set('URL', 'url');
            return db
                .createBinary(kdbxweb.ProtectedValue.fromString('bin.txt content'))
                .then((binary) => {
                    entry.binaries.set('bin.txt', binary);
                    entry.pushHistory();
                    entry.fields.set('Title', 'newtitle');
                    entry.fields.set('UserName', 'newuser');
                    entry.fields.set('Password', kdbxweb.ProtectedValue.fromString('newpass'));
                    entry.fields.set('CustomPlain', 'custom-plain');
                    entry.fields.set(
                        'CustomProtected',
                        kdbxweb.ProtectedValue.fromString('custom-protected')
                    );
                    entry.times.update();
                    return db.save().then((ab) => {
                        return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                            expect(db.meta.generator).to.be('KdbxWeb');
                            expect(db.meta.customData.get('key')).to.be('val');
                            expect(db.groups.length).to.be(1);
                            expect(db.groups[0].groups.length).to.be(2);
                            expect(db.getGroup(db.meta.recycleBinUuid!)).to.be(
                                db.groups[0].groups[0]
                            );
                            // require('fs').writeFileSync('resources/test.kdbx', Buffer.from(ab));
                            // require('fs').writeFileSync('resources/test.key', Buffer.from(keyFile));
                        });
                    });
                });
        });
    });

    it('creates random keyfile v2', () => {
        return kdbxweb.Credentials.createRandomKeyFile(2).then((keyFile) => {
            const cred = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString('demo'),
                keyFile
            );
            const db = kdbxweb.Kdbx.create(cred, 'example');
            const keyFileStr = kdbxweb.ByteUtils.bytesToString(keyFile).toString();
            expect(keyFileStr).to.contain('<Version>2.0</Version>');
            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.meta.generator).to.be('KdbxWeb');
                });
            });
        });
    });

    it('generates error for bad file', () => {
        // @ts-ignore
        return kdbxweb.Kdbx.load('file')
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('data');
            });
    });

    it('generates error for max bad version', () => {
        const file = new Uint8Array(TestResources.demoKdbx.byteLength);
        file.set(new Uint8Array(TestResources.demoKdbx));
        file[10] = 5;
        return kdbxweb.Kdbx.load(
            file.buffer,
            new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'))
        )
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidVersion);
            });
    });

    it('generates error for min bad version', () => {
        const file = new Uint8Array(TestResources.demoKdbx.byteLength);
        file.set(new Uint8Array(TestResources.demoKdbx));
        file[10] = 2;
        return kdbxweb.Kdbx.load(
            file.buffer,
            new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'))
        )
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidVersion);
            });
    });

    it('generates error for bad header hash', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        const file = new Uint8Array(TestResources.argon2.byteLength);
        file.set(new Uint8Array(TestResources.argon2));
        file[254] = 0;
        return kdbxweb.Kdbx.load(file.buffer, cred)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('header hash mismatch');
            });
    });

    it('generates error for bad header hmac', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        const file = new Uint8Array(TestResources.argon2.byteLength);
        file.set(new Uint8Array(TestResources.argon2));
        file[286] = 0;
        return kdbxweb.Kdbx.load(file.buffer, cred)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
    });

    it('generates error for saving bad version', () => {
        return kdbxweb.Credentials.createRandomKeyFile().then((keyFile) => {
            const cred = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString('demo'),
                keyFile
            );
            const db = kdbxweb.Kdbx.create(cred, 'example');
            db.header.setVersion(3);
            db.header.versionMajor = 1;
            return db
                .save()
                .then(() => {
                    throw 'Not expected';
                })
                .catch((e) => {
                    expect(e).to.be.a(kdbxweb.KdbxError);
                    expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidVersion);
                });
        });
    });

    it('generates error for bad credentials', () => {
        // @ts-ignore
        return kdbxweb.Kdbx.load(new ArrayBuffer(0), '123')
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for null credentials', () => {
        // @ts-ignore
        return kdbxweb.Kdbx.load(new ArrayBuffer(0), null)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for bad password', () => {
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'));
        return (
            cred
                // @ts-ignore
                .setPassword('string')
                .then(() => {
                    throw 'Not expected';
                })
                .catch((e) => {
                    expect(e).to.be.a(kdbxweb.KdbxError);
                    expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                    expect(e.message).to.contain('password');
                })
        );
    });

    it('generates error for bad keyfile', () => {
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'));
        return (
            cred
                // @ts-ignore
                .setKeyFile('123')
                .then(() => {
                    throw 'Not expected';
                })
                .catch((e) => {
                    expect(e).to.be.a(kdbxweb.KdbxError);
                    expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                    expect(e.message).to.contain('keyFile');
                })
        );
    });

    it('generates error for create with bad credentials', () => {
        expect(() => {
            // @ts-ignore
            kdbxweb.Kdbx.create('file');
        }).to.throwException((e) => {
            expect(e).to.be.a(kdbxweb.KdbxError);
            expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
            expect(e.message).to.contain('credentials');
        });
    });

    it('generates loadXml error for bad data', () => {
        // @ts-ignore
        return kdbxweb.Kdbx.loadXml(new ArrayBuffer(0))
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('data');
            });
    });

    it('generates loadXml error for bad credentials', () => {
        // @ts-ignore
        return kdbxweb.Kdbx.loadXml('str', null)
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for bad password', () => {
        return kdbxweb.Kdbx.load(
            TestResources.demoKdbx,
            new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('badpass'))
        )
            .then(() => {
                throw 'Not expected';
            })
            .catch((e) => {
                expect(e).to.be.ok();
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
    });

    it('deletes and restores an entry', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            const parentGroup = db.getDefaultGroup().groups[1];
            const group = parentGroup.groups[parentGroup.groups.length - 1];
            const recycleBin = db.getGroup(db.meta.recycleBinUuid!);
            const recycleBinLength = recycleBin!.groups.length;
            const groupLength = parentGroup.groups.length;
            db.remove(group);
            expect(recycleBin!.groups.length).to.be(recycleBinLength + 1);
            expect(group.groups.length).to.be(groupLength - 1);

            const parentGroupsBackup = group.parentGroup!.groups;
            group.parentGroup!.groups = [];
            db.move(group, parentGroup); // fake move; should not happen
            group.parentGroup!.groups = parentGroupsBackup;
            expect(recycleBin!.groups.length).to.be(recycleBinLength + 1);

            db.move(group, parentGroup);
            expect(recycleBin!.groups.length).to.be(recycleBinLength);
            checkDb(db);
        });
    });

    it('changes group order', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            const defaultGroup = db.getDefaultGroup();
            expect(defaultGroup.groups.length).to.be.greaterThan(3);
            const groupNames = defaultGroup.groups.map((g) => {
                return g.name;
            });
            const fromIndex = 2;
            const toIndex = 1;
            db.move(defaultGroup.groups[fromIndex], defaultGroup, toIndex);
            groupNames.splice(toIndex, 0, groupNames.splice(fromIndex, 1)[0]);
            const newGroupNames = defaultGroup.groups.map((g) => {
                return g.name;
            });
            expect(newGroupNames).to.eql(groupNames);
            db.move(defaultGroup.groups[fromIndex], defaultGroup, toIndex);
            checkDb(db);
        });
    });

    it('deletes entry without recycle bin', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            const parentGroup = db.getDefaultGroup().groups[1];
            const group = parentGroup.groups[parentGroup.groups.length - 1];
            const deletedObjectsLength = db.deletedObjects.length;
            db.meta.recycleBinEnabled = false;
            db.remove(group);
            expect(db.deletedObjects.length).to.be(deletedObjectsLength + 1);
            expect(db.deletedObjects[db.deletedObjects.length - 1].uuid).to.be(group.uuid);
        });
    });

    it('creates a recycle bin if it is enabled but not created', () => {
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((db) => {
            const parentGroup = db.getDefaultGroup().groups[1];
            const group = parentGroup.groups[parentGroup.groups.length - 1];
            db.meta.recycleBinUuid = new kdbxweb.KdbxUuid();
            expect(db.meta.recycleBinUuid.empty).to.be(true);
            let recycleBin = db.getGroup(db.meta.recycleBinUuid);
            expect(recycleBin).to.be(undefined);
            const groupLength = parentGroup.groups.length;
            db.remove(group);
            expect(db.meta.recycleBinUuid.empty).to.be(false);
            recycleBin = db.getGroup(db.meta.recycleBinUuid);
            expect(recycleBin).to.be.ok();
            expect(recycleBin!.groups.length).to.be(1);
            expect(group.groups.length).to.be(groupLength - 1);
        });
    });

    it('saves db to xml', () => {
        return kdbxweb.Credentials.createRandomKeyFile().then((keyFile) => {
            const cred = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString('demo'),
                keyFile
            );
            const db = kdbxweb.Kdbx.create(cred, 'example');
            const subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
            const entry = db.createEntry(subGroup);
            entry.fields.set('Title', 'title');
            entry.fields.set('UserName', 'user');
            entry.fields.set('Password', kdbxweb.ProtectedValue.fromString('pass'));
            entry.fields.set('Notes', 'notes');
            entry.fields.set('URL', 'url');
            entry.times.update();
            return db.saveXml().then((xml) => {
                expect(xml).to.contain('<Value ProtectInMemory="True">pass</Value>');
            });
        });
    });

    it('cleanups by history rules', () => {
        return kdbxweb.Credentials.createRandomKeyFile().then((keyFile) => {
            const cred = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString('demo'),
                keyFile
            );
            const db = kdbxweb.Kdbx.create(cred, 'example');
            const subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
            const entry = db.createEntry(subGroup);
            let i;
            for (i = 0; i < 3; i++) {
                entry.fields.set('Title', i.toString());
                entry.pushHistory();
            }
            expect(entry.history[0].fields.get('Title')).to.be('0');
            expect(entry.history.length).to.be(3);
            db.cleanup({ historyRules: true });
            expect(entry.history.length).to.be(3);
            for (i = 3; i < 10; i++) {
                entry.fields.set('Title', i.toString());
                entry.pushHistory();
            }
            expect(entry.history[0].fields.get('Title')).to.be('0');
            expect(entry.history.length).to.be(10);
            expect(entry.history[0].fields.get('Title')).to.be('0');
            db.cleanup({ historyRules: true });
            expect(entry.history[0].fields.get('Title')).to.be('0');
            expect(entry.history.length).to.be(10);
            for (i = 10; i < 11; i++) {
                entry.fields.set('Title', i.toString());
                entry.pushHistory();
            }
            expect(entry.history.length).to.be(11);
            db.cleanup({ historyRules: true });
            expect(entry.history[0].fields.get('Title')).to.be('1');
            expect(entry.history.length).to.be(10);
            for (i = 11; i < 20; i++) {
                entry.fields.set('Title', i.toString());
                entry.pushHistory();
            }
            db.cleanup({ historyRules: true });
            expect(entry.history[0].fields.get('Title')).to.be('10');
            expect(entry.history.length).to.be(10);
            for (i = 20; i < 30; i++) {
                entry.fields.set('Title', i.toString());
                entry.pushHistory();
            }
            db.meta.historyMaxItems = -1;
            db.cleanup({ historyRules: true });
            expect(entry.history[0].fields.get('Title')).to.be('10');
            expect(entry.history.length).to.be(20);
            db.cleanup();
            db.cleanup({});
            expect(entry.history.length).to.be(20);
            db.meta.historyMaxItems = undefined;
            db.cleanup({ historyRules: true });
            expect(entry.history[0].fields.get('Title')).to.be('10');
            expect(entry.history.length).to.be(20);
        });
    });

    it('cleanups custom icons', () => {
        return kdbxweb.Credentials.createRandomKeyFile().then((keyFile) => {
            const cred = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString('demo'),
                keyFile
            );
            const db = kdbxweb.Kdbx.create(cred, 'example');
            const subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
            const entry = db.createEntry(subGroup);
            let i;
            const ids = [
                kdbxweb.KdbxUuid.random(),
                kdbxweb.KdbxUuid.random(),
                kdbxweb.KdbxUuid.random(),
                kdbxweb.KdbxUuid.random(),
                kdbxweb.KdbxUuid.random(),
                kdbxweb.KdbxUuid.random()
            ];
            for (i = 0; i < 3; i++) {
                entry.fields.set('Title', i.toString());
                entry.customIcon = ids[0];
                entry.pushHistory();
            }
            entry.customIcon = ids[1];
            subGroup.customIcon = ids[2];

            const icon1 = new Uint8Array([1]).buffer;
            const icon2 = new Uint8Array([2]).buffer;
            const icon3 = new Uint8Array([3]).buffer;
            const rem1 = new Uint8Array([4]).buffer;
            const rem2 = new Uint8Array([5]).buffer;
            const rem3 = new Uint8Array([6]).buffer;

            db.meta.customIcons.set(ids[0].id, icon1);
            db.meta.customIcons.set(ids[1].id, icon2);
            db.meta.customIcons.set(ids[2].id, icon3);
            db.meta.customIcons.set(ids[3].id, rem1);
            db.meta.customIcons.set(ids[4].id, rem2);
            db.meta.customIcons.set(ids[5].id, rem3);
            db.cleanup({ customIcons: true });
            expect([...db.meta.customIcons]).to.eql([
                [ids[0].id, icon1],
                [ids[1].id, icon2],
                [ids[2].id, icon3]
            ]);
        });
    });

    it('cleanups binaries', () => {
        return kdbxweb.Credentials.createRandomKeyFile().then(async (keyFile) => {
            const cred = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString('demo'),
                keyFile
            );
            const db = kdbxweb.Kdbx.create(cred, 'example');
            const subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
            const entry = db.createEntry(subGroup);
            let i;
            const b1 = new Uint8Array([1]).buffer;
            const b2 = new Uint8Array([2]).buffer;
            for (i = 0; i < 3; i++) {
                entry.fields.set('Title', i.toString());
                entry.binaries.set('bin', await db.createBinary(b1));
                entry.pushHistory();
            }
            entry.binaries.set('bin', await db.createBinary(b2));
            await db.createBinary(new Uint8Array([3]));
            await db.createBinary(new Uint8Array([4]));
            await db.createBinary(new Uint8Array([5]));
            db.cleanup({ binaries: true });
            expect(db.binaries.getAll().map((e) => e.value)).to.eql([b1, b2]);
        });
    });

    it('imports an entry from another file', function () {
        this.timeout(10000);
        const cred = new kdbxweb.Credentials(
            kdbxweb.ProtectedValue.fromString('demo'),
            TestResources.demoKey
        );
        const db = kdbxweb.Kdbx.create(cred, 'example');
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then((sourceDb) => {
            const sourceEntryWithCustomIcon = sourceDb.groups[0].entries[0];
            const sourceEntryWithBinaries = sourceDb.groups[0].groups[0].entries[0];

            expect(sourceDb.groups[0].entries.length).to.be(2);
            expect(sourceEntryWithCustomIcon.customIcon).to.be.ok();
            expect([...sourceEntryWithBinaries.binaries.keys()]).to.eql(['attachment']);

            const importedEntryWithCustomIcon = db.importEntry(
                sourceEntryWithCustomIcon,
                db.groups[0],
                sourceDb
            );
            const importedEntryWithBinaries = db.importEntry(
                sourceEntryWithBinaries,
                db.groups[0],
                sourceDb
            );

            expect(importedEntryWithCustomIcon.uuid).not.to.eql(sourceEntryWithCustomIcon.uuid);
            expect(importedEntryWithBinaries.uuid).not.to.eql(sourceEntryWithBinaries.uuid);

            return db.save().then((ab) => {
                return kdbxweb.Kdbx.load(ab, cred).then((db) => {
                    expect(db.groups[0].entries.length).to.be(2);

                    const withCustomIcon = db.groups[0].entries[0];
                    const withBinaries = db.groups[0].entries[1];

                    expect(withCustomIcon.uuid).to.eql(importedEntryWithCustomIcon.uuid);
                    expect(withCustomIcon.customIcon).to.be.ok();
                    expect(db.meta.customIcons.get(withCustomIcon.customIcon!.id)).to.be.ok();

                    expect(withBinaries.uuid).to.eql(importedEntryWithBinaries.uuid);
                    expect([...withBinaries.binaries.keys()]).to.eql(['attachment']);
                });
            });
        });
    });

    it('creates missing uuids', () => {
        const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
        const xml = kdbxweb.ByteUtils.bytesToString(TestResources.emptyUuidXml).toString();
        return kdbxweb.Kdbx.loadXml(xml, cred).then((db) => {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.groups.length).to.be(1);
            expect(db.groups[0].uuid).to.be.ok();
            expect(db.groups[0].uuid.id).to.be.ok();
            const entry = db.groups[0].groups[0].entries[0];
            expect(entry.uuid).to.be.ok();
            expect(entry.uuid.id).to.be.ok();
            expect(entry.history.length).to.be.greaterThan(0);
            for (let i = 0; i < entry.history.length; i++) {
                const he = entry.history[i];
                expect(he.uuid).to.be.ok();
                expect(he.uuid.id).to.be(entry.uuid.id);
            }
        });
    });

    function checkDb(db: any) {
        expect(db.meta.name).to.be('demo');
        expect(db.meta.nameChanged.toISOString()).to.be('2015-08-16T14:45:23.000Z');
        expect(db.meta.desc).to.be('demo db');
        expect(db.meta.descChanged.toISOString()).to.be('2015-08-16T14:45:23.000Z');
        expect(db.meta.defaultUser).to.be('me');
        expect(db.meta.defaultUserChanged.toISOString()).to.be('2015-08-16T14:45:23.000Z');
        expect(db.meta.mntncHistoryDays).to.be(365);
        expect(db.meta.color).to.be('#FF0000');
        expect(db.meta.keyChanged.toISOString()).to.be('2015-08-16T14:53:28.000Z');
        expect(db.meta.keyChangeRec).to.be(-1);
        expect(db.meta.keyChangeForce).to.be(-1);
        expect(db.meta.recycleBinEnabled).to.be(true);
        expect(db.meta.recycleBinUuid.id).to.be('fZ7q9U4TBU+5VomeW3BZOQ==');
        expect(db.meta.recycleBinChanged.toISOString()).to.be('2015-08-16T14:44:42.000Z');
        expect(db.meta.entryTemplatesGroup.empty).to.be(true);
        expect(db.meta.entryTemplatesGroupChanged.toISOString()).to.be('2015-08-16T14:44:42.000Z');
        expect(db.meta.historyMaxItems).to.be(10);
        expect(db.meta.historyMaxSize).to.be(6291456);
        expect(db.meta.lastSelectedGroup.id).to.be('LWIve8M1xUuvrORCdYeRgA==');
        expect(db.meta.lastTopVisibleGroup.id).to.be('LWIve8M1xUuvrORCdYeRgA==');
        expect(db.meta.memoryProtection.title).to.be(false);
        expect(db.meta.memoryProtection.userName).to.be(false);
        expect(db.meta.memoryProtection.password).to.be(true);
        expect(db.meta.memoryProtection.url).to.be(false);
        expect(db.meta.memoryProtection.notes).to.be(false);
        expect(db.meta.customIcons.size).to.be(1);
        expect(db.meta.customIcons.get('rr3vZ1ozek+R4pAcLeqw5w==')).to.be.ok();

        const binaries = db.binaries.getAll();
        expect(binaries.length).to.be(1);
        expect(binaries[0].ref).to.be.ok();
        expect(binaries[0].value).to.be.ok();

        expect(db.deletedObjects.length).to.be(1);
        expect(db.deletedObjects[0].uuid.id).to.be('LtoeZ26BBkqtr93N9tqO4g==');
        expect(db.deletedObjects[0].deletionTime.toISOString()).to.be('2015-08-16T14:50:13.000Z');

        expect(db.groups.length).to.be(1);
        checkGroup(db.groups[0], {
            uuid: 'LWIve8M1xUuvrORCdYeRgA==',
            name: 'sample',
            notes: '',
            icon: 49,
            times: {
                creationTime: new Date('2015-08-16T14:44:42Z'),
                lastModTime: new Date('2015-08-16T14:44:42Z'),
                lastAccessTime: new Date('2015-08-16T14:50:15Z'),
                expiryTime: new Date('2015-08-16T14:43:04Z'),
                expires: false,
                usageCount: 28,
                locationChanged: new Date('2015-08-16T14:44:42Z')
            },
            expanded: true,
            defaultAutoTypeSeq: '',
            enableAutoType: null,
            enableSearching: null,
            lastTopVisibleEntry: 'HzYFsnGCkEKyrPtOa6bNMA==',
            groups: 4,
            entries: 2
        });
        const topGroup = db.groups[0];
        checkGroup(topGroup.groups[0], {
            uuid: 'GaN4R2PK1U63ckOVDzTY6w==',
            name: 'General',
            notes: '',
            icon: 48,
            times: {
                creationTime: new Date('2015-08-16T14:45:23Z'),
                lastModTime: new Date('2015-08-16T14:45:23Z'),
                lastAccessTime: new Date('2015-08-16T14:45:51Z'),
                expiryTime: new Date('2015-08-16T14:43:04Z'),
                expires: false,
                usageCount: 3,
                locationChanged: new Date('2015-08-16T14:45:23Z')
            },
            expanded: true,
            defaultAutoTypeSeq: '',
            enableAutoType: null,
            enableSearching: null,
            lastTopVisibleEntry: 'vqcoCvE9/k6PSgutKI6snw==',
            groups: 0,
            entries: 1
        });
        const expEntry = {
            uuid: 'vqcoCvE9/k6PSgutKI6snw==',
            icon: 2,
            customIcon: undefined,
            fgColor: '#FF0000',
            bgColor: '#00FF00',
            overrideUrl: 'cmd://{GOOGLECHROME} "{URL}"',
            tags: ['my', 'tag'],
            times: {
                creationTime: new Date('2015-08-16T14:45:54Z'),
                lastModTime: new Date('2015-08-16T14:49:12Z'),
                lastAccessTime: new Date('2015-08-16T14:49:23Z'),
                expiryTime: new Date('2015-08-29T21:00:00Z'),
                expires: true,
                usageCount: 3,
                locationChanged: new Date('2015-08-16T14:45:54Z')
            } as kdbxweb.KdbxTimes | undefined,
            fields: new Map([
                ['Notes', 'some notes'],
                ['Title', 'my entry'],
                ['URL', 'http://me.me'],
                ['UserName', 'me'],
                ['my field', 'my val']
            ]),
            prFields: new Map([
                ['Password', 'mypass'],
                ['my field protected', 'protected val']
            ]),
            binaries: new Map([
                [
                    'attachment',
                    {
                        hash: '6de2ccb163da5f925ea9cdc1298b7c1bd6f7afbbbed41f3d52352f9efbd9db8a',
                        value: true
                    }
                ]
            ]),
            autoType: {
                enabled: true,
                obfuscation: 0,
                defaultSequence: '{USERNAME}{TAB}{PASSWORD}{ENTER}{custom}',
                items: [
                    {
                        window: 'chrome',
                        keystrokeSequence: '{USERNAME}{TAB}{PASSWORD}{ENTER}{custom}{custom-key}'
                    }
                ]
            },
            history: 1
        };
        checkEntry(topGroup.groups[0].entries[0], expEntry);
        expEntry.times = undefined;
        expEntry.fields.set('Title', 'my-entry');
        expEntry.prFields.set('Password', 'pass');
        expEntry.history = 0;
        checkEntry(topGroup.groups[0].entries[0].history[0], expEntry);
        checkGroup(topGroup.groups[1], {
            uuid: 'QF6yl7EUVk6+NgdJtyl3sg==',
            name: 'Windows',
            notes: '',
            icon: 38,
            expanded: false,
            defaultAutoTypeSeq: '',
            enableAutoType: null,
            enableSearching: null,
            lastTopVisibleEntry: 'AAAAAAAAAAAAAAAAAAAAAA==',
            groups: 1,
            entries: 0
        });
        checkGroup(topGroup.groups[2], {
            uuid: 'nBnVmN3JYkalgnMu9fVcXQ==',
            name: 'Internet',
            notes: '',
            icon: 1,
            expanded: true,
            defaultAutoTypeSeq: '',
            enableAutoType: null,
            enableSearching: null,
            lastTopVisibleEntry: 'AAAAAAAAAAAAAAAAAAAAAA==',
            groups: 0,
            entries: 0
        });
        checkGroup(topGroup.groups[3], {
            uuid: 'fZ7q9U4TBU+5VomeW3BZOQ==',
            name: 'Recycle Bin',
            notes: '',
            icon: 43,
            expanded: false,
            defaultAutoTypeSeq: '',
            enableAutoType: false,
            enableSearching: false,
            lastTopVisibleEntry: 'AAAAAAAAAAAAAAAAAAAAAA==',
            groups: 2,
            entries: 1
        });
    }

    function checkGroup(group: kdbxweb.KdbxGroup, exp: any) {
        expect(group).to.be.ok();
        expect(group.uuid?.id).to.be(exp.uuid);
        expect(group.name).to.be(exp.name);
        expect(group.notes).to.be(exp.notes);
        expect(group.icon).to.be(exp.icon);
        expect(group.expanded).to.be(exp.expanded);
        expect(group.defaultAutoTypeSeq).to.be(exp.defaultAutoTypeSeq);
        expect(group.enableAutoType).to.be(exp.enableAutoType);
        expect(group.enableSearching).to.be(exp.enableSearching);
        expect(group.lastTopVisibleEntry?.id).to.be(exp.lastTopVisibleEntry);
        expect(group.groups.length).to.be(exp.groups);
        expect(group.entries.length).to.be(exp.entries);
        if (exp.times) {
            expect(group.times).to.be.eql(exp.times);
        }
        expect(group.enableAutoType).to.be.eql(exp.enableAutoType);
        expect(group.defaultAutoTypeSeq).to.be.eql(exp.defaultAutoTypeSeq);
    }

    function checkEntry(entry: kdbxweb.KdbxEntry, exp: any) {
        expect(entry).to.be.ok();
        expect(entry.uuid.id).to.be(exp.uuid);
        expect(entry.icon).to.be(exp.icon);
        expect(entry.customIcon).to.be(exp.customIcon);
        expect(entry.fgColor).to.be(exp.fgColor);
        expect(entry.bgColor).to.be(exp.bgColor);
        expect(entry.overrideUrl).to.be(exp.overrideUrl);
        expect(entry.tags).to.be.eql(exp.tags);
        if (exp.times) {
            expect(entry.times).to.be.eql(exp.times);
        }
        expect(entry.fields.size).to.be((exp.fields.size | 0) + (exp.prFields.size | 0));
        for (const [field, value] of exp.fields.entries()) {
            expect(entry.fields.get(field)).to.be(value);
        }
        for (const [field, value] of exp.prFields.entries()) {
            expect((entry.fields.get(field) as kdbxweb.ProtectedValue).getText()).to.be(value);
        }
        expect(entry.binaries.size).to.be(exp.binaries.size);
        for (const [field, value] of exp.binaries.entries()) {
            expect((entry.binaries.get(field) as KdbxBinaryWithHash).hash).to.be(value.hash);
            expect(!!(entry.binaries.get(field) as KdbxBinaryWithHash).value).to.be(!!value.value);
        }
        expect(entry.autoType).to.be.eql(exp.autoType);
        expect(entry.history.length).to.be(exp.history);
    }
});
