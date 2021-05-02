import * as fs from 'fs';
import { Credentials, CryptoEngine, Kdbx, ProtectedValue } from '../lib';
import { argon2 } from '../test/test-support/argon2';

CryptoEngine.setArgon2Impl(argon2);

const GroupsCount = 100;
const EntriesCount = 10000;

const fileName = `${GroupsCount}G-${EntriesCount}E`;

const credentials = new Credentials(ProtectedValue.fromString(''));
const db = Kdbx.create(credentials, fileName);
const groups = [db.getDefaultGroup()];
for (let i = 0; i < GroupsCount; i++) {
    const parentGroup = groups[Math.floor(Math.random() * groups.length)];
    const group = db.createGroup(parentGroup, `Group ${i}`);
    groups.push(group);
}

for (let i = 0; i < EntriesCount; i++) {
    const parentGroup = groups[Math.floor(Math.random() * groups.length)];
    const entry = db.createEntry(parentGroup);
    entry.fields.set('Title', `Entry ${i}`);
    if (Math.random() < 0.5) {
        entry.fields.set('UserName', `User ${i}`);
    }
    if (Math.random() < 0.5) {
        entry.fields.set('Password', ProtectedValue.fromString(`Password ${i}`));
    }
    if (Math.random() < 0.5) {
        entry.fields.set('URL', `http://website${i}.com`);
    }
}

db.save()
    .then((data) => {
        console.log('Done, generated', fileName + '.kdbx');
        fs.writeFileSync(fileName + '.kdbx', Buffer.from(data));
    })
    .catch((e) => console.error(e));
