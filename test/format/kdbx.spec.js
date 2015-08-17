'use strict';

var expect = require('expect.js'),
    kdbxweb = require('../../lib/index'),
    TestResources = require('../test-support/test-resources');

describe('Kdbx', function () {
    it('should load simple file', function () {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        var db = kdbxweb.Kdbx.load(TestResources.demoKdbx, cred);
        expect(db).to.be.a(kdbxweb.Kdbx);
        expect(db.meta.generator).to.be('KeePass');
        checkDb(db);
    });

    it('should load utf8 uncompressed file', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('пароль'));
        var db = kdbxweb.Kdbx.load(TestResources.cyrillicKdbx, cred);
        expect(db).to.be.a(kdbxweb.Kdbx);
    });

    it('should successfully load saved file', function() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), TestResources.demoKey);
        var db = kdbxweb.Kdbx.load(TestResources.demoKdbx, cred);
        expect(db).to.be.a(kdbxweb.Kdbx);
        var ab = db.save();
        db = kdbxweb.Kdbx.load(ab, cred);
        expect(db.meta.generator).to.be('KdbxWeb');
        checkDb(db);
    });

    it('generates error for bad arguments', function () {
        expect(function() {
            kdbxweb.Kdbx.load('file');
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('data');
            });
        expect(function() {
            kdbxweb.Kdbx.load(new ArrayBuffer(0), '123');
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
        expect(function() {
            kdbxweb.Kdbx.load(new ArrayBuffer(0), null);
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidArg);
                expect(e.message).to.contain('credentials');
            });
    });

    it('generates error for bad password', function () {
        expect(function() {
            kdbxweb.Kdbx.load(TestResources.demoKdbx,
                new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('badpass')));
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.InvalidKey);
            });
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
        expect(Object.keys(db.meta.binaries).length).to.be(1);
        expect(db.meta.binaries['0']).to.be.ok();

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
            enableAutoType: undefined,
            enableSearching: undefined,
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
            enableAutoType: undefined,
            enableSearching: undefined,
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
                attachment: { ref: '0', value: true }
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
        expEntry.binaries.attachment.value = false;
        checkEntry(topGroup.groups[0].entries[0].history[0], expEntry);
        checkGroup(topGroup.groups[1], {
            uuid: 'QF6yl7EUVk6+NgdJtyl3sg==',
            name: 'Windows',
            notes: '',
            icon: 38,
            expanded: false,
            defaultAutoTypeSeq: '',
            enableAutoType: undefined,
            enableSearching: undefined,
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
            enableAutoType: undefined,
            enableSearching: undefined,
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
