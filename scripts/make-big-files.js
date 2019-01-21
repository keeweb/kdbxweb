const fs = require("fs");
const kdbxweb = require("../lib");

const GroupsCount = 100;
const EntriesCount = 10000;

const fileName = `${GroupsCount}G-${EntriesCount}E`;

const credentials = new kdbxweb.Credentials(
  kdbxweb.ProtectedValue.fromString("")
);
const db = kdbxweb.Kdbx.create(credentials, fileName);
const groups = [db.getDefaultGroup()];
for (let i = 0; i < GroupsCount; i++) {
  let parentGroup = groups[Math.floor(Math.random() * groups.length)];
  const group = db.createGroup(parentGroup, `Group ${i}`);
  groups.push(group);
}

for (let i = 0; i < EntriesCount; i++) {
  let parentGroup = groups[Math.floor(Math.random() * groups.length)];
  const entry = db.createEntry(parentGroup);
  entry.fields.Title = `Entry ${i}`;
  if (Math.random() < 0.5) {
    entry.fields.UserName = `User ${i}`;
  }
  if (Math.random() < 0.5) {
    entry.fields.Password = kdbxweb.ProtectedValue.fromString(`Password ${i}`);
  }
  if (Math.random() < 0.5) {
    entry.fields.URL = `http://website${i}.com`;
  }
}

db.save().then(data => {
  fs.writeFileSync(fileName + ".kdbx", Buffer.from(data));
});
