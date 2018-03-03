'use strict';

var expect = require('expect.js'),
    kdbxweb = require('../../lib/index'),
    argon2 = require('../test-support/argon2'),
    TestResources = require('../test-support/test-resources');

describe('Kdbx', function () {
    var cryptoEngineArgon2 = kdbxweb.CryptoEngine.argon2;

    before(function() {
        kdbxweb.CryptoEngine.argon2 = argon2;
    });

    after(function() {
        kdbxweb.CryptoEngine.argon2 = cryptoEngineArgon2;
    });

    it('loads simple file', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.meta.generator).to.be('KeePass');
            checkDb(db);
        });
    });

    it('loads simple xml file', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
        var xml = kdbxweb.ByteUtils.bytesToString(TestResources.demoXml).toString('utf8');
        return kdbxweb.Kdbx.loadXml(xml, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.meta.generator).to.be('KeePass');
            checkDb(db);
        });
    });

    it('generates error for malformed xml file', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
        return kdbxweb.Kdbx.loadXml('malformed-xml', cred)
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
    });

    it('loads utf8 uncompressed file', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('пароль'));
        return kdbxweb.Kdbx.load(TestResources.cyrillicKdbx, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with binary key', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('test'), TestResources.binKeyKey);
        return kdbxweb.Kdbx.load(TestResources.binKeyKdbx, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with empty pass', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
        return kdbxweb.Kdbx.load(TestResources.emptyPass, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with empty pass and keyfile', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''), TestResources.emptyPassWithKeyFileKey);
        return kdbxweb.Kdbx.load(TestResources.emptyPassWithKeyFile, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a file with no pass and keyfile', function() {
        var cred = new kdbxweb.Credentials(null, TestResources.noPassWithKeyFileKey);
        return kdbxweb.Kdbx.load(TestResources.noPassWithKeyFile, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a 32-byte keyfile', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('test'), TestResources.key32KeyFile);
        return kdbxweb.Kdbx.load(TestResources.key32, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a 64-byte keyfile', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('test'), TestResources.key64KeyFile);
        return kdbxweb.Kdbx.load(TestResources.key64, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('loads a xml-bom keyfile', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('test'), TestResources.keyWithBomKeyFile);
        return kdbxweb.Kdbx.load(TestResources.keyWithBom, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
        });
    });

    it('successfully loads saved file', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            return db.save().then(function(ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function(db) {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx4 file with argon2 kdf', function() {
        this.timeout(10000);
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.argon2, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            return db.save().then(function(ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function(db) {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx3 file with chacha20', function() {
        this.timeout(10000);
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.aesChaCha, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.header.dataCipherUuid.toString()).to.be(kdbxweb.Consts.CipherId.ChaCha20);
            checkDb(db);
            return db.save().then(function(ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function(db) {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    expect(db.header.dataCipherUuid.toString()).to.be(kdbxweb.Consts.CipherId.ChaCha20);
                    checkDb(db);
                });
            });
        });
    });

    it('loads kdbx4 file with aes kdf', function() {
        this.timeout(10000);
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'));
        return kdbxweb.Kdbx.load(TestResources.aesKdfKdbx4, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            expect(db.header.dataCipherUuid.toString()).to.be(kdbxweb.Consts.CipherId.Aes);
            return db.save().then(function(ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function(db) {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    expect(db.header.dataCipherUuid.toString()).to.be(kdbxweb.Consts.CipherId.Aes);
                });
            });
        });
    });

    it('loads kdbx4 file with argon2 kdf and chacha20 encryption', function() {
        this.timeout(10000);
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.argon2ChaCha, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            return db.save().then(function(ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function(db) {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    checkDb(db);
                });
            });
        });
    });

    it('upgrades file to latest version', function() {
        this.timeout(10000);
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            return db.save().then(function(ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function(db) {
                    expect(db.header.versionMajor).to.be(4);
                    checkDb(db);
                });
            });
        });
    });

    it('saves kdbx4 to xml and loads it back', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            return db.saveXml().then(function(xml) {
                return kdbxweb.Kdbx.loadXml(xml, cred).then(function(db) {
                    checkDb(db);
                });
            });
        });
    });

    it('saves and loads custom data', function() {
        this.timeout(10000);
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            var iconId = kdbxweb.KdbxUuid.random();
            expect(db).to.be.a(kdbxweb.Kdbx);
            checkDb(db);
            db.upgrade();
            db.getDefaultGroup().groups[0].customData = { custom: 'group' };
            db.getDefaultGroup().groups[0].customIcon = iconId;
            db.getDefaultGroup().entries[0].customData = { custom: 'entry' };
            return db.save().then(function(ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function(db) {
                    expect(db.header.versionMajor).to.be(4);
                    expect(db.getDefaultGroup().groups[0].customData).to.eql({ custom: 'group' });
                    expect(db.getDefaultGroup().groups[0].customIcon.toString()).to.eql(iconId.toString());
                    expect(db.getDefaultGroup().entries[0].customData).to.eql({ custom: 'entry' });
                    checkDb(db);
                });
            });
        });
    });

    it('creates new database', function() {
        var keyFile = kdbxweb.Credentials.createRandomKeyFile();
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFile);
        var db = kdbxweb.Kdbx.create(cred, 'example');
        var subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
        var entry = db.createEntry(subGroup);
        db.meta.customData.key = 'val';
        db.createDefaultGroup();
        db.createRecycleBin();
        entry.fields.Title = 'title';
        entry.fields.UserName = 'user';
        entry.fields.Password = kdbxweb.ProtectedValue.fromString('pass');
        entry.fields.Notes = 'notes';
        entry.fields.URL = 'url';
        return db.createBinary(kdbxweb.ProtectedValue.fromString('bin.txt content')).then(function(binary) {
            entry.binaries['bin.txt'] = binary;
            entry.pushHistory();
            entry.fields.Title = 'newtitle';
            entry.fields.UserName = 'newuser';
            entry.fields.Password = kdbxweb.ProtectedValue.fromString('newpass');
            entry.fields.CustomPlain = 'custom-plain';
            entry.fields.CustomProtected = kdbxweb.ProtectedValue.fromString('custom-protected');
            entry.times.update();
            return db.save().then(function (ab) {
                return kdbxweb.Kdbx.load(ab, cred).then(function (db) {
                    expect(db.meta.generator).to.be('KdbxWeb');
                    expect(db.meta.customData.key).to.be('val');
                    expect(db.groups.length).to.be(1);
                    expect(db.groups[0].groups.length).to.be(2);
                    expect(db.getGroup(db.meta.recycleBinUuid)).to.be(db.groups[0].groups[0]);
                    // require('fs').writeFileSync('resources/test.kdbx', Buffer.from(ab));
                    // require('fs').writeFileSync('resources/test.key', Buffer.from(keyFile));
                });
            });
        });
    });

    it('generates error for bad file', function () {
        return kdbxweb.Kdbx.load('file')
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('data');
            });
    });

    it('generates error for max bad version', function () {
        var file = new Uint8Array(TestResources.demoKdbx.byteLength);
        file.set(new Uint8Array(TestResources.demoKdbx));
        file[10] = 5;
        return kdbxweb.Kdbx.load(file.buffer, new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo')))
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidVersion);
            });
    });

    it('generates error for min bad version', function () {
        var file = new Uint8Array(TestResources.demoKdbx.byteLength);
        file.set(new Uint8Array(TestResources.demoKdbx));
        file[10] = 2;
        return kdbxweb.Kdbx.load(file.buffer, new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo')))
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidVersion);
            });
    });

    it('generates error for bad header hash', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        var file = new Uint8Array(TestResources.argon2.byteLength);
        file.set(new Uint8Array(TestResources.argon2));
        file[254] = 0;
        return kdbxweb.Kdbx.load(file.buffer, cred)
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('header hash mismatch');
            });
    });

    it('generates error for bad header hmac', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        var file = new Uint8Array(TestResources.argon2.byteLength);
        file.set(new Uint8Array(TestResources.argon2));
        file[286] = 0;
        return kdbxweb.Kdbx.load(file.buffer, cred)
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
    });

    it('generates error for saving bad version', function () {
        var keyFile = kdbxweb.Credentials.createRandomKeyFile();
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFile);
        var db = kdbxweb.Kdbx.create(cred, 'example');
        db.header.versionMajor = 1;
        return db.save()
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidVersion);
            });
    });

    it('generates error for bad credentials', function () {
        return kdbxweb.Kdbx.load(new ArrayBuffer(0), '123')
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for null credentials', function () {
        return kdbxweb.Kdbx.load(new ArrayBuffer(0), null)
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for bad password', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'));
        return cred.setPassword('string')
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('password');
            });
    });

    it('generates error for bad keyfile', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'));
        return cred.setKeyFile('123')
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('keyFile');
            });
    });

    it('generates error for create with bad credentials', function() {
        expect(function() {
            kdbxweb.Kdbx.create('file');
        }).to.throwException(function(e) {
            expect(e).to.be.a(kdbxweb.KdbxError);
            expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
            expect(e.message).to.contain('credentials');
        });
    });

    it('generates loadXml error for bad data', function() {
        return kdbxweb.Kdbx.loadXml(new ArrayBuffer(0))
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('data');
            });
    });

    it('generates loadXml error for bad credentials', function() {
        return kdbxweb.Kdbx.loadXml('str', null)
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for bad password', function () {
        return kdbxweb.Kdbx.load(TestResources.demoKdbx,
            new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('badpass')))
            .then(function () {
                throw 'Not expected';
            })
            .catch(function (e) {
                expect(e).to.be.ok();
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
    });

    it('deletes and restores an entry', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            var parentGroup = db.getDefaultGroup().groups[1];
            var group = parentGroup.groups[parentGroup.groups.length - 1];
            var recycleBin = db.getGroup(db.meta.recycleBinUuid);
            var recycleBinLength = recycleBin.groups.length;
            var groupLength = parentGroup.groups.length;
            db.remove(group);
            expect(recycleBin.groups.length).to.be(recycleBinLength + 1);
            expect(group.groups.length).to.be(groupLength - 1);

            var parentGroupsBackup = group.parentGroup.groups;
            group.parentGroup.groups = [];
            db.move(group, parentGroup); // fake move; should not happen
            group.parentGroup.groups = parentGroupsBackup;
            expect(recycleBin.groups.length).to.be(recycleBinLength + 1);

            db.move(group, parentGroup);
            expect(recycleBin.groups.length).to.be(recycleBinLength);
            checkDb(db);
        });
    });

    it('changes group order', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            var defaultGroup = db.getDefaultGroup();
            expect(defaultGroup.groups.length).to.be.greaterThan(3);
            var groupNames = defaultGroup.groups.map(function(g) { return g.name; });
            var fromIndex = 2;
            var toIndex = 1;
            db.move(defaultGroup.groups[fromIndex], defaultGroup, toIndex);
            groupNames.splice(toIndex, 0, groupNames.splice(fromIndex, 1)[0]);
            var newGroupNames = defaultGroup.groups.map(function(g) { return g.name; });
            expect(newGroupNames).to.eql(groupNames);
            db.move(defaultGroup.groups[fromIndex], defaultGroup, toIndex);
            checkDb(db);
        });
    });

    it('deletes entry without recycle bin', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            var parentGroup = db.getDefaultGroup().groups[1];
            var group = parentGroup.groups[parentGroup.groups.length - 1];
            var deletedObjectsLength = db.deletedObjects.length;
            db.meta.recycleBinEnabled = false;
            db.remove(group);
            expect(db.deletedObjects.length).to.be(deletedObjectsLength + 1);
            expect(db.deletedObjects[db.deletedObjects.length - 1].uuid).to.be(group.uuid);
        });
    });

    it('creates a recycle bin if it is enabled but not created', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        return kdbxweb.Kdbx.load(TestResources.demoKdbx, cred).then(function(db) {
            var parentGroup = db.getDefaultGroup().groups[1];
            var group = parentGroup.groups[parentGroup.groups.length - 1];
            db.meta.recycleBinUuid = new kdbxweb.KdbxUuid();
            expect(db.meta.recycleBinUuid.empty).to.be(true);
            var recycleBin = db.getGroup(db.meta.recycleBinUuid);
            expect(recycleBin).to.be(undefined);
            var groupLength = parentGroup.groups.length;
            db.remove(group);
            expect(db.meta.recycleBinUuid.empty).to.be(false);
            recycleBin = db.getGroup(db.meta.recycleBinUuid);
            expect(recycleBin).to.be.ok();
            expect(recycleBin.groups.length).to.be(1);
            expect(group.groups.length).to.be(groupLength - 1);
        });
    });

    it('saves db to xml', function() {
        var keyFile = kdbxweb.Credentials.createRandomKeyFile();
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFile);
        var db = kdbxweb.Kdbx.create(cred, 'example');
        var subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
        var entry = db.createEntry(subGroup);
        entry.fields.Title = 'title';
        entry.fields.UserName = 'user';
        entry.fields.Password = kdbxweb.ProtectedValue.fromString('pass');
        entry.fields.Notes = 'notes';
        entry.fields.URL = 'url';
        entry.times.update();
        return db.saveXml().then(function(xml) {
            expect(xml).to.contain('<Value ProtectInMemory="True">pass</Value>');
        });
    });

    it('cleanups by history rules', function() {
        var keyFile = kdbxweb.Credentials.createRandomKeyFile();
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFile);
        var db = kdbxweb.Kdbx.create(cred, 'example');
        var subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
        var entry = db.createEntry(subGroup);
        var i;
        for (i = 0; i < 3; i++) {
            entry.fields.Title = i.toString();
            entry.pushHistory();
        }
        expect(entry.history[0].fields.Title).to.be('0');
        expect(entry.history.length).to.be(3);
        db.cleanup({historyRules: true});
        expect(entry.history.length).to.be(3);
        for (i = 3; i < 10; i++) {
            entry.fields.Title = i.toString();
            entry.pushHistory();
        }
        expect(entry.history[0].fields.Title).to.be('0');
        expect(entry.history.length).to.be(10);
        expect(entry.history[0].fields.Title).to.be('0');
        db.cleanup({historyRules: true});
        expect(entry.history[0].fields.Title).to.be('0');
        expect(entry.history.length).to.be(10);
        for (i = 10; i < 11; i++) {
            entry.fields.Title = i.toString();
            entry.pushHistory();
        }
        expect(entry.history.length).to.be(11);
        db.cleanup({historyRules: true});
        expect(entry.history[0].fields.Title).to.be('1');
        expect(entry.history.length).to.be(10);
        for (i = 11; i < 20; i++) {
            entry.fields.Title = i.toString();
            entry.pushHistory();
        }
        db.cleanup({historyRules: true});
        expect(entry.history[0].fields.Title).to.be('10');
        expect(entry.history.length).to.be(10);
        for (i = 20; i < 30; i++) {
            entry.fields.Title = i.toString();
            entry.pushHistory();
        }
        db.meta.historyMaxItems = -1;
        db.cleanup({historyRules: true});
        expect(entry.history[0].fields.Title).to.be('10');
        expect(entry.history.length).to.be(20);
        db.cleanup();
        db.cleanup({});
        expect(entry.history.length).to.be(20);
        db.meta.historyMaxItems = undefined;
        db.cleanup({historyRules: true});
        expect(entry.history[0].fields.Title).to.be('10');
        expect(entry.history.length).to.be(20);
    });

    it('cleanups custom icons', function() {
        var keyFile = kdbxweb.Credentials.createRandomKeyFile();
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFile);
        var db = kdbxweb.Kdbx.create(cred, 'example');
        var subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
        var entry = db.createEntry(subGroup);
        var i;
        for (i = 0; i < 3; i++) {
            entry.fields.Title = i.toString();
            entry.customIcon = 'i1';
            entry.pushHistory();
        }
        entry.customIcon = 'i2';
        subGroup.customIcon = 'i3';
        db.meta.customIcons.i1 = 'icon1';
        db.meta.customIcons.i2 = 'icon2';
        db.meta.customIcons.i3 = 'icon3';
        db.meta.customIcons.r1 = 'rem1';
        db.meta.customIcons.r2 = 'rem2';
        db.meta.customIcons.r3 = 'rem3';
        db.cleanup({customIcons: true});
        expect(db.meta.customIcons).to.eql({ i1: 'icon1', i2: 'icon2', i3: 'icon3' });
    });

    it('cleanups binaries', function() {
        var keyFile = kdbxweb.Credentials.createRandomKeyFile();
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFile);
        var db = kdbxweb.Kdbx.create(cred, 'example');
        var subGroup = db.createGroup(db.getDefaultGroup(), 'subgroup');
        var entry = db.createEntry(subGroup);
        var i;
        for (i = 0; i < 3; i++) {
            entry.fields.Title = i.toString();
            entry.binaries.bin = { ref: 'b1' };
            entry.pushHistory();
        }
        entry.binaries.bin = { ref: 'b2' };
        var b1 = new Uint8Array([1]).buffer;
        var b2 = new Uint8Array([2]).buffer;
        var b3 = new Uint8Array([3]).buffer;
        db.binaries.b1 = b1;
        db.binaries.b2 = b2;
        db.binaries.b3 = b3;
        db.cleanup({binaries: true});
        expect(db.binaries).to.eql({ b1: b1, b2: b2 });
    });

    function checkDb(db) {
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
        expect(Object.keys(db.meta.customIcons).length).to.be(1);
        expect(db.meta.customIcons['rr3vZ1ozek+R4pAcLeqw5w==']).to.be.ok();
        expect(Object.keys(db.binaries).length).to.be(1);
        expect(db.binaries.idToHash['0']).to.be.ok();
        expect(db.binaries[db.binaries.idToHash[0]]).to.be.ok();

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
        var topGroup = db.groups[0];
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
        var expEntry = {
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
            },
            fields: {
                Notes: 'some notes',
                Title: 'my entry',
                URL: 'http://me.me',
                UserName: 'me',
                'my field': 'my val'
            },
            prFields: {
                Password: 'mypass',
                'my field protected': 'protected val'
            },
            binaries: {
                attachment: { ref: '6de2ccb163da5f925ea9cdc1298b7c1bd6f7afbbbed41f3d52352f9efbd9db8a', value: true }
            },
            autoType: { enabled: true, obfuscation: 0, defaultSequence: '{USERNAME}{TAB}{PASSWORD}{ENTER}{custom}',
                items: [
                { window: 'chrome', keystrokeSequence: '{USERNAME}{TAB}{PASSWORD}{ENTER}{custom}{custom-key}' }
            ] },
            history: 1
        };
        checkEntry(topGroup.groups[0].entries[0], expEntry);
        delete expEntry.times;
        expEntry.fields.Title = 'my-entry';
        expEntry.prFields.Password = 'pass';
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

    function checkGroup(group, exp) {
        expect(group).to.be.ok();
        expect(group.uuid.id).to.be(exp.uuid);
        expect(group.name).to.be(exp.name);
        expect(group.notes).to.be(exp.notes);
        expect(group.icon).to.be(exp.icon);
        expect(group.expanded).to.be(exp.expanded);
        expect(group.defaultAutoTypeSeq).to.be(exp.defaultAutoTypeSeq);
        expect(group.enableAutoType).to.be(exp.enableAutoType);
        expect(group.enableSearching).to.be(exp.enableSearching);
        expect(group.lastTopVisibleEntry.id).to.be(exp.lastTopVisibleEntry);
        expect(group.groups.length).to.be(exp.groups);
        expect(group.entries.length).to.be(exp.entries);
        if (exp.times) {
            expect(group.times).to.be.eql(exp.times);
        }
        expect(group.autoType).to.be.eql(exp.autoType);
    }

    function checkEntry(entry, exp) {
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
        expect(Object.keys(entry.fields).length).to.be(Object.keys(exp.fields).length + Object.keys(exp.prFields).length);
        Object.keys(exp.fields).forEach(function(field) {
            expect(entry.fields[field]).to.be(exp.fields[field]);
        });
        Object.keys(exp.prFields).forEach(function(field) {
            expect(entry.fields[field].getText()).to.be(exp.prFields[field]);
        });
        expect(Object.keys(entry.binaries).length).to.be(Object.keys(exp.binaries).length);
        Object.keys(exp.binaries).forEach(function(field) {
            expect(entry.binaries[field].ref).to.be(exp.binaries[field].ref);
            expect(!!entry.binaries[field].value).to.be(!!exp.binaries[field].value);
        });
        expect(entry.autoType).to.be.eql(exp.autoType);
        expect(entry.history.length).to.be(exp.history);
    }
});
