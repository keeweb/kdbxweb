'use strict';

var expect = require('expect.js'),
    kdbxweb = require('../../lib/index');

describe('Kdbx.merge', function () {
    var dt = {
        pre1: new Date(2014, 1, 1), created: new Date(2015, 1, 1),
        upd1: new Date(2015, 1, 2), upd2: new Date(2015, 1, 3), upd3: new Date(2015, 1, 4),
        upd4: new Date(2015, 1, 5), upd5: new Date(2015, 1, 6), upd6: new Date(2015, 1, 7)
    };

    var id = {
        trash: null, name: null, tpl: null, eDel: null, eDel1: null, icon1: null, icon2: null, cd1: null,
        bin1: null, bin2: null, bin3: null,
        gRoot: null, g1: null, g11: null, g111: null, g112: null, g12: null, g2: null, g3: null, g31: null, g4: null, g5: null,
        er1: null
    };

    var bin = {
        bin1: null, bin2: null, bin3: null, icon1: null, icon2: null
    };

    Object.keys(id).forEach(function(key) { id[key] = kdbxweb.KdbxUuid.random(); });
    Object.keys(bin).forEach(function(key) { bin[key] = kdbxweb.ProtectedValue.fromString(key); });

    it('tests can check database structure', function () {
        var db = getTestDb();
        assertDbEquals(db, getTestDbStructure());
    });

    // self-merge

    it('merges itself', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.merge(remote);
        assertDbEquals(db, getTestDbStructure());
    });

    // errors

    it('generates merge error when merging db without root', function() {
        var db = getTestDb(),
            remote = kdbxweb.Kdbx.create(new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo')));
        remote.groups = [];
        expect(function() {
            db.merge(remote);
        }).to.throwException(function(e) {
                expect(e).to.be.a(kdbxweb.KdbxError);
                expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.MergeError);
                expect(e.message).to.contain('no default group');
            });
    });

    it('generates merge error when merging another db', function() {
        var db = getTestDb(),
            remote = kdbxweb.Kdbx.create(new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo')));
        expect(function() {
            db.merge(remote);
        }).to.throwException(function(e) {
            expect(e).to.be.a(kdbxweb.KdbxError);
            expect(e.code).to.be(kdbxweb.Consts.ErrorCodes.MergeError);
            expect(e.message).to.contain('default group is different');
        });
    });

    // deletedObjects

    it('merges deleted objects', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var delObj = new remote.deletedObjects[0].constructor();
        delObj.uuid = id.eDel1;
        delObj.deletionTime = dt.upd2;
        remote.deletedObjects.splice(0, 1);
        remote.deletedObjects.push(delObj);
        db.merge(remote);
        var del = {};
        del[id.eDel] = dt.upd1;
        del[id.eDel1] = dt.upd2;
        assertDbEquals(db, { del: del });
    });

    // meta

    it('merges metadata when remote is later', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.meta.name = 'name1';
        remote.meta.nameChanged = dt.upd2;
        remote.meta.desc = 'desc1';
        remote.meta.descChanged = dt.upd2;
        remote.meta.defaultUser = 'user1';
        remote.meta.defaultUserChanged = dt.upd2;
        remote.meta.mntncHistoryDays = 100;
        remote.meta.settingsChanged = dt.upd2;
        remote.meta.keyChanged = dt.upd2;
        remote.meta.keyChangeRec = 1000;
        remote.meta.keyChangeForce = 2000;
        remote.meta.recycleBinEnabled = false;
        remote.meta.recycleBinUuid = id.g1;
        remote.meta.recycleBinChanged = dt.upd2;
        remote.meta.entryTemplatesGroup = id.g2;
        remote.meta.entryTemplatesGroupChanged = dt.upd2;
        remote.meta.historyMaxItems = 100;
        remote.meta.historyMaxSize = 100000000;
        remote.meta.color = '#ff0000';
        db.merge(remote);
        assertDbEquals(db, {
            meta: {
                name: 'name1',
                nameChanged: dt.upd2,
                desc: 'desc1',
                descChanged: dt.upd2,
                defaultUser: 'user1',
                defaultUserChanged: dt.upd2,
                mntncHistoryDays: 100,
                settingsChanged: dt.upd2,
                keyChanged: dt.upd2,
                keyChangeRec: 1000,
                keyChangeForce: 2000,
                recycleBinEnabled: false,
                recycleBinUuid: id.g1,
                recycleBinChanged: dt.upd2,
                entryTemplatesGroup: id.g2,
                entryTemplatesGroupChanged: dt.upd2,
                historyMaxItems: 100,
                historyMaxSize: 100000000,
                color: '#ff0000'
            }
        });
    });

    it('merges metadata when local is later', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.meta.name = 'name1';
        db.meta.nameChanged = dt.upd2;
        db.meta.desc = 'desc1';
        db.meta.descChanged = dt.upd2;
        db.meta.defaultUser = 'user1';
        db.meta.defaultUserChanged = dt.upd2;
        db.meta.mntncHistoryDays = 100;
        db.meta.keyChanged = dt.upd2;
        db.meta.keyChangeRec = 1000;
        db.meta.keyChangeForce = 2000;
        db.meta.recycleBinEnabled = false;
        db.meta.recycleBinUuid = id.g1;
        db.meta.recycleBinChanged = dt.upd2;
        db.meta.entryTemplatesGroup = id.g2;
        db.meta.entryTemplatesGroupChanged = dt.upd2;
        db.meta.historyMaxItems = 100;
        db.meta.historyMaxSize = 100000000;
        db.meta.color = '#ff0000';
        db.merge(remote);
        assertDbEquals(db, {
            meta: {
                name: 'name1',
                nameChanged: dt.upd2,
                desc: 'desc1',
                descChanged: dt.upd2,
                defaultUser: 'user1',
                defaultUserChanged: dt.upd2,
                mntncHistoryDays: 100,
                keyChanged: dt.upd2,
                keyChangeRec: 1000,
                keyChangeForce: 2000,
                recycleBinEnabled: false,
                recycleBinUuid: id.g1,
                recycleBinChanged: dt.upd2,
                entryTemplatesGroup: id.g2,
                entryTemplatesGroupChanged: dt.upd2,
                historyMaxItems: 100,
                historyMaxSize: 100000000,
                color: '#ff0000'
            }
        });
    });

    it('merges binaries', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var binaries = {};
        binaries[id.bin1] = bin.bin1;
        binaries[id.bin2] = bin.bin2;
        binaries[id.bin3] = bin.bin3;
        db.groups[0].entries[0].binaries[id.bin2] = { ref: id.bin2 };
        db.groups[0].entries[0].history[0].binaries[id.bin2] = { ref: id.bin3 };
        db.binaries[id.bin2] = bin.bin2;
        remote.binaries[id.bin3] = bin.bin3;
        db.merge(remote);
        assertDbEquals(db, { binaries: binaries });
    });

    it('merges custom icons', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var customIcons = {};
        customIcons[id.icon2] = bin.icon2;
        customIcons[id.bin1] = bin.bin1;
        customIcons[id.bin2] = bin.bin2;
        db.meta.customIcons[id.bin1] = bin.bin1;
        db.groups[0].customIcon = id.bin1;
        db.groups[0].times.update();
        remote.meta.customIcons[id.bin2] = bin.bin2;
        remote.groups[0].entries[0].customIcon = id.bin2;
        remote.groups[0].entries[0].times.update();
        db.merge(remote);
        assertDbEquals(db, { meta: { customIcons: customIcons } });
    });

    it('merges custom data', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var customData = { cd1: 'data1', dLocal: 'local', dRemote: 'remote' };
        db.meta.customData.dLocal = 'local';
        remote.meta.customData.dRemote = 'remote';
        db.merge(remote);
        assertDbEquals(db, { meta: { customData: customData } });
    });

    // groups: remote

    it('changes remote group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var grp = remote.getDefaultGroup();
        grp.name = 'root1';
        grp.notes = 'notes1';
        grp.icon = 1;
        grp.customIcon = id.icon2;
        grp.times.lastModTime = dt.upd2;
        grp.expanded = true;
        grp.defaultAutoTypeSeq = 'seq1';
        grp.enableAutoType = false;
        grp.enableSearching = false;
        grp.lastTopVisibleEntry = id.eDel1;
        grp.groups[1].customIcon = id.icon1;
        grp.groups[1].times.lastModTime = dt.upd2;
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.name = 'root1';
        exp.root.notes = 'notes1';
        exp.root.icon = 1;
        exp.root.customIcon = id.icon2;
        exp.root.modified = dt.upd2;
        exp.root.expanded = true;
        exp.root.defaultAutoTypeSeq = 'seq1';
        exp.root.enableAutoType = false;
        exp.root.enableSearching = false;
        exp.root.lastTopVisibleEntry = id.eDel1;
        assertDbEquals(db, exp);
    });

    it('adds new remote group to root', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var group = remote.createGroup(remote.getDefaultGroup(), 'newgrp');
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups.push({ uuid: group.uuid, name: group.name });
        assertDbEquals(db, exp);
    });

    it('adds new remote group to deep group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var group = remote.createGroup(remote.getDefaultGroup().groups[1].groups[0], 'newgrp');
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups[1].groups[0].groups.push({ uuid: group.uuid, name: group.name });
        assertDbEquals(db, exp);
    });

    it('deletes remote group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().groups[1].groups[0], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups[1].groups.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('moves remote group to root', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().groups[1].groups[0], remote.getDefaultGroup());
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups.push(exp.root.groups[1].groups[0]);
        exp.root.groups[1].groups.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('moves remote group to deep group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().groups[1].groups[0], remote.getDefaultGroup().groups[3]);
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups[3].groups.push(exp.root.groups[1].groups[0]);
        exp.root.groups[1].groups.splice(0, 1);
        assertDbEquals(db, exp);
    });

    // groups: local

    it('changes local group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var grp = db.getDefaultGroup();
        grp.name = 'root1';
        grp.notes = 'notes1';
        grp.icon = 1;
        grp.customIcon = id.icon2;
        grp.times.lastModTime = dt.upd2;
        grp.expanded = true;
        grp.defaultAutoTypeSeq = 'seq1';
        grp.enableAutoType = false;
        grp.enableSearching = false;
        grp.lastTopVisibleEntry = id.eDel1;
        grp.groups[1].customIcon = id.icon1;
        grp.groups[1].times.lastModTime = dt.upd2;
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.name = 'root1';
        exp.root.notes = 'notes1';
        exp.root.icon = 1;
        exp.root.customIcon = id.icon2;
        exp.root.modified = dt.upd2;
        exp.root.expanded = true;
        exp.root.defaultAutoTypeSeq = 'seq1';
        exp.root.enableAutoType = false;
        exp.root.enableSearching = false;
        exp.root.lastTopVisibleEntry = id.eDel1;
        assertDbEquals(db, exp);
    });

    it('adds new local group to root', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var group = db.createGroup(db.getDefaultGroup(), 'newgrp');
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups.push({ uuid: group.uuid, name: group.name });
        assertDbEquals(db, exp);
    });

    it('adds new local group to deep group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var group = db.createGroup(db.getDefaultGroup().groups[1].groups[0], 'newgrp');
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups[1].groups[0].groups.push({ uuid: group.uuid, name: group.name });
        assertDbEquals(db, exp);
    });

    it('deletes local group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(db.getDefaultGroup().groups[1].groups[0], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups[1].groups.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('moves local group to root', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.move(db.getDefaultGroup().groups[1].groups[0], db.getDefaultGroup());
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups.push(exp.root.groups[1].groups[0]);
        exp.root.groups[1].groups.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('moves local group to deep group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.move(db.getDefaultGroup().groups[1].groups[0], db.getDefaultGroup().groups[3]);
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups[3].groups.push(exp.root.groups[1].groups[0]);
        exp.root.groups[1].groups.splice(0, 1);
        assertDbEquals(db, exp);
    });

    // groups: local+remote

    it('deletes group moved to subgroup of locally deleted group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().groups[1].groups[0], remote.getDefaultGroup().groups[3].groups[1]);
        tick();
        db.move(db.getDefaultGroup().groups[3], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups[1].groups.splice(0, 1);
        exp.root.groups.splice(3, 1);
        assertDbEquals(db, exp);
    });

    it('deletes group moved to subgroup of remotely deleted group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.move(db.getDefaultGroup().groups[1].groups[0], db.getDefaultGroup().groups[3].groups[1]);
        tick();
        remote.move(remote.getDefaultGroup().groups[3], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups[1].groups.splice(0, 1);
        exp.root.groups.splice(3, 1);
        assertDbEquals(db, exp);
    });

    it('deletes group moved out of subgroup of locally deleted group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().groups[1].groups[0], remote.getDefaultGroup().groups[3].groups[1]);
        tick();
        db.move(db.getDefaultGroup().groups[1], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups.splice(1, 1);
        assertDbEquals(db, exp);
    });

    it('deletes group moved out of subgroup of remotely deleted group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.move(db.getDefaultGroup().groups[1].groups[0], db.getDefaultGroup().groups[3].groups[1]);
        tick();
        remote.move(remote.getDefaultGroup().groups[1], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups.splice(1, 1);
        assertDbEquals(db, exp);
    });

    it('moves group moved to locally moved group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().groups[1].groups[0], remote.getDefaultGroup().groups[3].groups[0]);
        tick();
        db.move(db.getDefaultGroup().groups[3], db.getDefaultGroup().groups[2]);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups[3].groups[0].groups.push(exp.root.groups[1].groups[0]);
        exp.root.groups[1].groups.splice(0, 1);
        exp.root.groups[2].groups.push(exp.root.groups[3]);
        exp.root.groups.splice(3, 1);
        assertDbEquals(db, exp);
    });

    it('moves group moved to remotely moved group', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().groups[3], remote.getDefaultGroup().groups[2]);
        tick();
        db.move(db.getDefaultGroup().groups[1].groups[0], db.getDefaultGroup().groups[3].groups[0]);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        exp.root.groups[3].groups[0].groups.push(exp.root.groups[1].groups[0]);
        exp.root.groups[1].groups.splice(0, 1);
        exp.root.groups[2].groups.push(exp.root.groups[3]);
        exp.root.groups.splice(3, 1);
        assertDbEquals(db, exp);
    });

    // groups: reorder

    it('moves group back', function() {
        var db = getTestDb(),
            remote = getTestDb();

        var group4 = db.createGroup(db.getDefaultGroup(), 'g4');
        group4.uuid = id.g4;
        group4.times.lastModTime = group4.times.locationChanged = dt.upd1;
        var group5 = db.createGroup(db.getDefaultGroup(), 'g5');
        group5.uuid = id.g5;
        group5.times.lastModTime = group5.times.locationChanged = dt.upd1;
        db.getDefaultGroup().groups.splice(1, 2, db.getDefaultGroup().groups[2], db.getDefaultGroup().groups[1]);
        db.getDefaultGroup().groups[1].times.lastModTime = dt.upd3;

        group5 = remote.createGroup(remote.getDefaultGroup(), 'g5');
        group5.uuid = id.g5;
        group5.times.lastModTime = group5.times.locationChanged = dt.upd2;
        group4 = remote.createGroup(remote.getDefaultGroup(), 'g4');
        group4.uuid = id.g4;
        group4.times.lastModTime = group4.times.locationChanged = dt.upd1;

        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups.splice(1, 2, exp.root.groups[2], exp.root.groups[1]);
        exp.root.groups[1].modified = dt.upd3;
        exp.root.groups.push({ uuid: id.g5, name: 'g5' });
        exp.root.groups.push({ uuid: id.g4, name: 'g4' });
        assertDbEquals(db, exp);
    });

    it('moves group forward', function() {
        var db = getTestDb(),
            remote = getTestDb();

        var group4 = db.createGroup(db.getDefaultGroup(), 'g4');
        group4.uuid = id.g4;
        group4.times.lastModTime = group4.times.locationChanged = dt.upd1;
        var group5 = db.createGroup(db.getDefaultGroup(), 'g5');
        group5.uuid = id.g5;
        group5.times.lastModTime = group5.times.locationChanged = dt.upd1;
        db.getDefaultGroup().groups.splice(1, 2, db.getDefaultGroup().groups[2], db.getDefaultGroup().groups[1]);
        db.getDefaultGroup().groups[2].times.lastModTime = dt.upd3;

        group5 = remote.createGroup(remote.getDefaultGroup(), 'g5');
        group5.uuid = id.g5;
        group5.times.lastModTime = group5.times.locationChanged = dt.upd1;
        group4 = remote.createGroup(remote.getDefaultGroup(), 'g4');
        group4.uuid = id.g4;
        group4.times.lastModTime = group4.times.locationChanged = dt.upd2;

        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups.splice(1, 2, exp.root.groups[2], exp.root.groups[1]);
        exp.root.groups[2].modified = dt.upd3;
        exp.root.groups.push({ uuid: id.g5, name: 'g5' });
        exp.root.groups.push({ uuid: id.g4, name: 'g4' });
        assertDbEquals(db, exp);
    });

    it('inserts group at start', function() {
        var db = getTestDb(),
            remote = getTestDb();

        var group4 = remote.createGroup(remote.getDefaultGroup(), 'g4');
        group4.uuid = id.g4;
        group4.times.lastModTime = group4.times.locationChanged = dt.upd2;
        remote.getDefaultGroup().groups.splice(remote.getDefaultGroup().groups.length - 1, 1);
        remote.getDefaultGroup().groups.unshift(group4);

        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.groups.unshift({ uuid: id.g4, name: 'g4' });
        assertDbEquals(db, exp);
    });

    // entries

    it('deletes remote entry', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().entries[0], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        delete exp.meta.customIcons;
        exp.root.entries.splice(0, 1);
        exp.binaries = {};
        assertDbEquals(db, exp);
    });

    it('deletes local entry', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.move(db.getDefaultGroup().entries[0], null);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        delete exp.meta.customIcons;
        exp.root.entries.splice(0, 1);
        exp.binaries = {};
        assertDbEquals(db, exp);
    });

    it('moves remote entry', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.move(remote.getDefaultGroup().entries[0], remote.getDefaultGroup().groups[1]);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        delete exp.meta.customIcons;
        exp.root.groups[1].entries.push(exp.root.entries[0]);
        exp.root.entries.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('moves local entry', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.move(db.getDefaultGroup().entries[0], db.getDefaultGroup().groups[1]);
        db.merge(remote);
        var exp = getTestDbStructure();
        delete exp.del;
        delete exp.meta.customIcons;
        exp.root.groups[1].entries.push(exp.root.entries[0]);
        exp.root.entries.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('changes remote entry', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var ab = new ArrayBuffer(0);
        var prVal = kdbxweb.ProtectedValue.fromString('secret');
        var entry = remote.getDefaultGroup().entries[0];
        entry.icon = 21;
        entry.fgColor = '#aa0000';
        entry.bgColor = '#00aa00';
        entry.overrideUrl = '1234';
        entry.tags = 'tags1';
        entry.times.lastModTime = dt.upd4;
        entry.fields = { Password: 'pass', Another: 'field', Protected: prVal };
        entry.binaries = { bin1: { ref: id.bin1 }, bin2: bin.bin2, ab: ab };
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].icon = 21;
        exp.root.entries[0].fgColor = '#aa0000';
        exp.root.entries[0].bgColor = '#00aa00';
        exp.root.entries[0].overrideUrl = '1234';
        exp.root.entries[0].tags = 'tags1';
        exp.root.entries[0].modified = dt.upd4;
        exp.root.entries[0].fields = { Password: 'pass', Another: 'field', Protected: prVal };
        exp.root.entries[0].binaries = { bin1: { ref: id.bin1 }, bin2: bin.bin2, ab: ab };
        exp.root.entries[0].history.push({ modified: dt.upd3, tags: 'tags' });
        assertDbEquals(db, exp);
    });

    it('ignores remote entry with same date', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var ab = new ArrayBuffer(0);
        var prVal = kdbxweb.ProtectedValue.fromString('secret');
        var entry = remote.getDefaultGroup().entries[0];
        entry.icon = 21;
        entry.fgColor = '#aa0000';
        entry.bgColor = '#00aa00';
        entry.overrideUrl = '1234';
        entry.tags = 'tags1';
        entry.fields = { Password: 'pass', Another: 'field', Protected: prVal };
        entry.binaries = { bin1: { ref: id.bin1 }, bin2: bin.bin2, ab: ab };
        db.merge(remote);
        var exp = getTestDbStructure();
        assertDbEquals(db, exp);
    });

    it('changes local entry', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var ab = new ArrayBuffer(0);
        var prVal = kdbxweb.ProtectedValue.fromString('secret');
        var entry = db.getDefaultGroup().entries[0];
        entry.pushHistory();
        entry.icon = 21;
        entry.fgColor = '#aa0000';
        entry.bgColor = '#00aa00';
        entry.overrideUrl = '1234';
        entry.tags = 'tags1';
        entry.times.lastModTime = dt.upd4;
        entry.fields = { Password: 'pass', Another: 'field', Protected: prVal };
        entry.binaries = { bin1: { ref: id.bin1 }, bin2: bin.bin2, ab: ab };
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].icon = 21;
        exp.root.entries[0].fgColor = '#aa0000';
        exp.root.entries[0].bgColor = '#00aa00';
        exp.root.entries[0].overrideUrl = '1234';
        exp.root.entries[0].tags = 'tags1';
        exp.root.entries[0].modified = dt.upd4;
        exp.root.entries[0].fields = { Password: 'pass', Another: 'field', Protected: prVal };
        exp.root.entries[0].binaries = { bin1: { ref: id.bin1 }, bin2: bin.bin2, ab: ab };
        exp.root.entries[0].history.push({ modified: dt.upd3, tags: 'tags' });
        assertDbEquals(db, exp);
    });

    it('deletes history state remotely', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.getDefaultGroup().entries[0].removeHistory(0);
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].history.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('deletes history state locally', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.getDefaultGroup().entries[0].removeHistory(0);
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].history.splice(0, 1);
        assertDbEquals(db, exp);
    });

    it('deletes all history states remotely', function() {
        var db = getTestDb(),
            remote = getTestDb();
        remote.getDefaultGroup().entries[0].removeHistory(0, 5);
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].history = [];
        assertDbEquals(db, exp);
    });

    it('deletes all history states locally', function() {
        var db = getTestDb(),
            remote = getTestDb();
        db.getDefaultGroup().entries[0].removeHistory(0, 5);
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].history = [];
        assertDbEquals(db, exp);
    });

    it('adds past history state remotely', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var remoteEntry = remote.getDefaultGroup().entries[0];
        var entry = db.getDefaultGroup().entries[0];
        remoteEntry.times.lastModTime = dt.upd3;
        entry.times.lastModTime = dt.upd4;
        remoteEntry.pushHistory();
        remoteEntry.times.lastModTime = dt.upd4;
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].modified = dt.upd4;
        exp.root.entries[0].history.push({ modified: dt.upd3, tags: 'tags' });
        assertDbEquals(db, exp);
    });

    it('adds future history state remotely and converts current state into history', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var remoteEntry = remote.getDefaultGroup().entries[0];
        var entry = db.getDefaultGroup().entries[0];
        remoteEntry.times.lastModTime = dt.upd4;
        remoteEntry.tags = 't4';
        remoteEntry.pushHistory();
        remoteEntry.times.lastModTime = dt.upd5;
        remoteEntry.tags = 'tRemote';
        entry.tags = 'tLocal';
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].modified = dt.upd5;
        exp.root.entries[0].tags = 'tRemote';
        exp.root.entries[0].history.push({ modified: dt.upd3, tags: 'tLocal' });
        exp.root.entries[0].history.push({ modified: dt.upd4, tags: 't4' });
        assertDbEquals(db, exp);
    });

    it('adds history state locally and converts remote state into history', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var remoteEntry = remote.getDefaultGroup().entries[0];
        var entry = db.getDefaultGroup().entries[0];
        remoteEntry.times.lastModTime = dt.upd5;
        remoteEntry.tags = 'tRemote';
        entry.tags = 't4';
        entry.times.lastModTime = dt.upd4;
        entry.pushHistory();
        entry.tags = 'tLocal';
        entry.times.lastModTime = dt.upd6;
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].modified = dt.upd6;
        exp.root.entries[0].tags = 'tLocal';
        exp.root.entries[0].history.push({ modified: dt.upd4, tags: 't4' });
        exp.root.entries[0].history.push({ modified: dt.upd5, tags: 'tRemote' });
        assertDbEquals(db, exp);
    });

    it('can merge with old entry state without state deletions', function() {
        var db = getTestDb(),
            remote = getTestDb();
        var entry = db.getDefaultGroup().entries[0];
        entry.times.lastModTime = dt.upd4;
        entry.tags = 't4';
        entry.pushHistory();
        entry.tags = 'tLocal';
        entry.times.lastModTime = dt.upd5;
        entry._editState = undefined;
        db.merge(remote);
        var exp = getTestDbStructure();
        exp.root.entries[0].tags = 'tLocal';
        exp.root.entries[0].modified = dt.upd5;
        exp.root.entries[0].history.push({ modified: dt.upd3, tags: 'tags' });
        exp.root.entries[0].history.push({ modified: dt.upd4, tags: 't4' });
        assertDbEquals(db, exp);
    });

    // edit state management

    it('saves and restores edit state', function() {
        var db = getTestDb(),
            remote = getTestDb();

        db.getDefaultGroup().entries[0].removeHistory(0);
        db.meta.historyMaxItems = 500;

        db.removeLocalEditState();
        db.merge(remote);
        var exp = getTestDbStructure();
        assertDbEquals(db, exp);

        db.getDefaultGroup().entries[0].removeHistory(0);
        db.meta.historyMaxItems = 500;
        var editState = db.getLocalEditState();
        editState = JSON.parse(JSON.stringify(editState));
        db.removeLocalEditState();
        db.setLocalEditState(editState);
        db.merge(remote);

        exp.meta.historyMaxItems = 500;
        exp.root.entries[0].history.splice(0, 1);
    });

    function getTestDbStructure() {
        var exp = {
            meta: {
                name: 'name',
                nameChanged: dt.created,
                desc: 'desc',
                descChanged: dt.created,
                defaultUser: 'user',
                defaultUserChanged: dt.created,
                mntncHistoryDays: 10,
                keyChanged: dt.created,
                keyChangeRec: 100,
                keyChangeForce: 200,
                recycleBinEnabled: true,
                recycleBinUuid: id.trash,
                recycleBinChanged: dt.created,
                entryTemplatesGroup: id.tpl,
                entryTemplatesGroupChanged: dt.created,
                historyMaxItems: 10,
                historyMaxSize: 10000,
                customIcons: {},
                customData: { cd1: 'data1' }
            },
            binaries: {},
            del: {},
            root: {
                uuid: id.gRoot,
                name: 'root',
                notes: 'notes',
                icon: 1,
                customIcon: id.icon1,
                modified: dt.upd1,
                expanded: false,
                defaultAutoTypeSeq: 'seq',
                enableAutoType: true,
                enableSearching: true,
                lastTopVisibleEntry: null,
                groups: [{
                    uuid: id.trash, name: 'trash', groups: [], entries: []
                }, {
                    uuid: id.g1, name: 'g1', entries: [],
                    groups: [{
                        uuid: id.g11, name: 'g11',
                        groups: [{
                            uuid: id.g111, name: 'g111', groups: [], entries: []
                        }, {
                            uuid: id.g112, name: 'g112', groups: [], entries: []
                        }]
                    }, {
                        uuid: id.g12, name: 'g12', groups: [], entries: []
                    }]
                }, {
                    uuid: id.g2, name: 'g2', groups: [], entries: []
                }, {
                    uuid: id.g3, name: 'g3',
                    groups: [{
                        uuid: id.g31, name: 'g31', groups: [], entries: []
                    }]
                }],
                entries: [{
                    uuid: id.er1,
                    icon: 2,
                    customIcon: id.icon2,
                    fgColor: '#ff0000',
                    bgColor: '#00ff00',
                    overrideUrl: '123',
                    tags: 'tags',
                    modified: dt.upd3,
                    fields: { Title: 'er1', Password: 'pass' },
                    binaries: { 'bin1': { ref: id.bin1 } },
                    history: [{
                        modified: dt.upd1, tags: 'tags1'
                    }, {
                        modified: dt.upd2, tags: 'tags2'
                    }]
                }]
            }
        };
        exp.del[id.eDel] = dt.upd1;
        exp.binaries[id.bin1] = bin.bin1;
        exp.meta.customIcons[id.icon1] = bin.icon1;
        exp.meta.customIcons[id.icon2] = bin.icon2;
        return exp;
    }

    function getTestDb() {
        var cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'));
        var db = kdbxweb.Kdbx.create(cred);

        db.meta._name = 'name';
        db.meta.nameChanged = dt.created;
        db.meta._desc = 'desc';
        db.meta.descChanged = dt.created;
        db.meta._defaultUser = 'user';
        db.meta.defaultUserChanged = dt.created;
        db.meta._mntncHistoryDays = 10;
        db.meta.settingsChanged = dt.created;
        db.meta.keyChanged = dt.created;
        db.meta._keyChangeRec = 100;
        db.meta._keyChangeForce = 200;
        db.meta._recycleBinEnabled = true;
        db.meta._recycleBinUuid = id.trash;
        db.meta.recycleBinChanged = dt.created;
        db.meta._entryTemplatesGroup = id.tpl;
        db.meta.entryTemplatesGroupChanged = dt.created;
        db.meta._historyMaxItems = 10;
        db.meta._historyMaxSize = 10000;
        db.meta.customIcons[id.icon1] = bin.icon1;
        db.meta.customIcons[id.icon2] = bin.icon2;
        db.meta.customData.cd1 = 'data1';
        db.meta._editState = undefined;
        db.binaries[id.bin1] = bin.bin1;

        var root = db.getDefaultGroup();
        root.uuid = id.gRoot;
        root.name = 'root';
        root.notes = 'notes';
        root.icon = 1;
        root.customIcon = id.icon1;
        root.times.lastModTime = dt.upd1;
        root.times.locationChanged = dt.upd1;
        root.expanded = false;
        root.defaultAutoTypeSeq = 'seq';
        root.enableAutoType = true;
        root.enableSearching = true;
        root.lastTopVisibleEntry = null;

        var recycleBin = root.groups[0];
        recycleBin.uuid = id.trash;
        recycleBin.name = 'trash';
        recycleBin.times.lastModTime = dt.upd1;
        recycleBin.times.locationChanged = dt.upd1;

        var entry = db.createEntry(root);
        entry.uuid = id.eDel;
        db.move(entry, null);
        db.deletedObjects[0].deletionTime = dt.upd1;

        entry = db.createEntry(root);
        entry.uuid = id.er1;
        entry.icon = 2;
        entry.customIcon = id.icon2;
        entry.fgColor = '#ff0000';
        entry.bgColor = '#00ff00';
        entry.overrideUrl = '123';
        entry.tags = 'tags1';
        entry.times.lastModTime = dt.upd3;
        entry.times.locationChanged = dt.upd1;
        entry.fields = { Title: 'er1', Password: 'pass' };
        entry.binaries.bin1 = { ref: id.bin1 };
        entry.pushHistory();
        entry.tags = 'tags2';
        entry.history[0].times.lastModTime = dt.upd1;
        entry.pushHistory();
        entry.tags = 'tags';
        entry.history[1].times.lastModTime = dt.upd2;
        entry._editState = null;

        var group1 = db.createGroup(root, 'g1');
        group1.uuid = id.g1;
        group1.times.lastModTime = group1.times.locationChanged = dt.upd1;
        var group11 = db.createGroup(group1, 'g11');
        group11.uuid = id.g11;
        group11.times.lastModTime = group11.times.locationChanged = dt.upd1;
        var group111 = db.createGroup(group11, 'g111');
        group111.uuid = id.g111;
        group111.times.lastModTime = group111.times.locationChanged = dt.upd1;
        var group112 = db.createGroup(group11, 'g112');
        group112.uuid = id.g112;
        group112.times.lastModTime = group112.times.locationChanged = dt.upd1;
        var group12 = db.createGroup(group1, 'g12');
        group12.uuid = id.g12;
        group12.times.lastModTime = group12.times.locationChanged = dt.upd1;
        var group2 = db.createGroup(root, 'g2');
        group2.uuid = id.g2;
        group2.times.lastModTime = group2.times.locationChanged = dt.upd1;
        var group3 = db.createGroup(root, 'g3');
        group3.uuid = id.g3;
        group3.times.lastModTime = group3.times.locationChanged = dt.upd1;
        var group31 = db.createGroup(group3, 'g31');
        group31.uuid = id.g31;
        group31.times.lastModTime = group31.times.locationChanged = dt.upd1;

        return db;
    }

    function assertDbEquals(db, exp) {
        if (exp.meta) {
            if (exp.meta.name) { expect(db.meta.name).to.eql(exp.meta.name); }
            if (exp.meta.nameChanged) { expect(db.meta.nameChanged).to.eql(exp.meta.nameChanged); }
            if (exp.meta.desc) { expect(db.meta.desc).to.eql(exp.meta.desc); }
            if (exp.meta.descChanged) { expect(db.meta.descChanged).to.eql(exp.meta.descChanged); }
            if (exp.meta.defaultUser) { expect(db.meta.defaultUser).to.eql(exp.meta.defaultUser); }
            if (exp.meta.defaultUserChanged) { expect(db.meta.defaultUserChanged).to.eql(exp.meta.defaultUserChanged); }
            if (exp.meta.mntncHistoryDays) { expect(db.meta.mntncHistoryDays).to.eql(exp.meta.mntncHistoryDays); }
            if (exp.meta.settingsChanged) { expect(db.meta.settingsChanged).to.eql(exp.meta.settingsChanged); }
            if (exp.meta.keyChanged) { expect(db.meta.keyChanged).to.eql(exp.meta.keyChanged); }
            if (exp.meta.keyChangeRec) { expect(db.meta.keyChangeRec).to.eql(exp.meta.keyChangeRec); }
            if (exp.meta.keyChangeForce) { expect(db.meta.keyChangeForce).to.eql(exp.meta.keyChangeForce); }
            if (exp.meta.recycleBinEnabled) { expect(db.meta.recycleBinEnabled).to.eql(exp.meta.recycleBinEnabled); }
            if (exp.meta.recycleBinUuid) { expect(db.meta.recycleBinUuid).to.eql(exp.meta.recycleBinUuid); }
            if (exp.meta.recycleBinChanged) { expect(db.meta.recycleBinChanged).to.eql(exp.meta.recycleBinChanged); }
            if (exp.meta.entryTemplatesGroup) { expect(db.meta.entryTemplatesGroup).to.eql(exp.meta.entryTemplatesGroup); }
            if (exp.meta.entryTemplatesGroupChanged) { expect(db.meta.entryTemplatesGroupChanged).to.eql(exp.meta.entryTemplatesGroupChanged); }
            if (exp.meta.historyMaxItems) { expect(db.meta.historyMaxItems).to.eql(exp.meta.historyMaxItems); }
            if (exp.meta.historyMaxSize) { expect(db.meta.historyMaxSize).to.eql(exp.meta.historyMaxSize); }
            if (exp.meta.customData) { expect(db.meta.customData).to.eql(exp.meta.customData); }
            if (exp.meta.customIcons) { expect(db.meta.customIcons).to.eql(exp.meta.customIcons); }
        }
        if (exp.binaries) {
            expect(db.binaries).to.eql(exp.binaries);
        }
        if (exp.del) {
            expect(db.deletedObjects.length).to.be(Object.keys(exp.del).length);
            var del = {};
            db.deletedObjects.forEach(function(d) { del[d.uuid] = d.deletionTime; });
            expect(del).to.eql(exp.del);
        }
        if (exp.root) {
            expect(db.getDefaultGroup().parentGroup).to.be(undefined);
            assertGroupEquals(db.getDefaultGroup(), exp.root);
        }
    }

    function assertGroupEquals(group, exp) {
        if (exp.uuid) { expect(group.uuid).to.eql(exp.uuid); }
        if (exp.name) { expect(group.name).to.eql(exp.name); }
        if (exp.notes) { expect(group.notes).to.eql(exp.notes); }
        if (exp.icon) { expect(group.icon).to.eql(exp.icon); }
        if (exp.customIcon) { expect(group.customIcon).to.eql(exp.customIcon); }
        if (exp.modified) { expect(group.times.lastModTime).to.eql(exp.modified); }
        if (exp.expanded) { expect(group.expanded).to.eql(exp.expanded); }
        if (exp.defaultAutoTypeSeq) { expect(group.defaultAutoTypeSeq).to.eql(exp.defaultAutoTypeSeq); }
        if (exp.enableAutoType) { expect(group.enableAutoType).to.eql(exp.enableAutoType); }
        if (exp.enableSearching) { expect(group.enableSearching).to.eql(exp.enableSearching); }
        if (exp.lastTopVisibleEntry) { expect(group.lastTopVisibleEntry).to.eql(exp.lastTopVisibleEntry); }
        if (exp.groups) {
            expect(group.groups.length).to.be(exp.groups.length);
            group.groups.forEach(function(grp, ix) {
                expect(grp.parentGroup).to.be(group);
                assertGroupEquals(grp, exp.groups[ix]);
            });
        }
        if (exp.entries) {
            expect(group.entries.length).to.be(exp.entries.length);
            group.entries.forEach(function(entry, ix) {
                expect(entry.parentGroup).to.be(group);
                assertEntryEquals(entry, exp.entries[ix]);
            });
        }
    }

    function assertEntryEquals(entry, exp) {
        if (exp.uuid) { expect(entry.uuid).to.eql(exp.uuid); }
        if (exp.icon) { expect(entry.icon).to.eql(exp.icon); }
        if (exp.customIcon) { expect(entry.customIcon).to.eql(exp.customIcon); }
        if (exp.fgColor) { expect(entry.fgColor).to.eql(exp.fgColor); }
        if (exp.bgColor) { expect(entry.bgColor).to.eql(exp.bgColor); }
        if (exp.overrideUrl) { expect(entry.overrideUrl).to.eql(exp.overrideUrl); }
        if (exp.tags) { expect(entry.tags).to.eql(exp.tags); }
        if (exp.modified) { expect(entry.times.lastModTime).to.eql(exp.modified); }
        if (exp.fields) { expect(entry.fields).to.eql(exp.fields); }
        if (exp.binaries) { expect(entry.binaries).to.eql(exp.binaries); }
        if (exp.history) {
            expect(entry.history.length).to.be(exp.history.length);
            entry.history.forEach(function(historyEntry, ix) { assertEntryEquals(historyEntry, exp.history[ix]); });
        }
    }

    function tick() {
        var dt = new Date();
        while (new Date() <= dt) {
            continue;
        }
    }
});
