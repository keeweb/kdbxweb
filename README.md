# KdbxWeb [![Build status](https://travis-ci.org/antelle/kdbxweb.svg?branch=master)](https://travis-ci.org/antelle/kdbxweb) [![Coverage Status](https://coveralls.io/repos/antelle/kdbxweb/badge.svg?branch=master&service=github)](https://coveralls.io/github/antelle/kdbxweb?branch=master)

KdbxWeb is a high-performance javascript library for reading/writing KeePass v2 databases (kdbx) in node.js or browser.

## Features

- runs in browser or node.js
- no native addons
- average file open time is 200ms
- total ≈150kB with dependencies
- full support of Kdbx features
- protected values are stored in memory XOR'ed

## Browser support

- modern browsers: IE10+, Firefox, Chrome, Safari 7+, Opera
- node.js

## Usage

##### Loading

```javascript
var credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFileArrayBuffer);
var db = kdbxweb.Kdbx.load(data, credentials);
```

##### Saving

```javascript
var dataAsArrayBuffer = db.save();
var xmlAsString = db.saveXml();
```

##### File info
[Header object fields](https://github.com/antelle/kdbxweb/blob/master/lib/format/kdbx-header.js#L26)  
[Meta object fields](https://github.com/antelle/kdbxweb/blob/master/lib/format/kdbx-meta.js#L15)  
```javascript
db.meta
db.header
```

##### Changing credentials
```javascript
var db = kdbxweb.Kdbx.load(data, credentials);
db.credentials.setPassword(kdbxweb.ProtectedValue.fromString('newPass'));
var randomKeyFile = kdbxweb.Credentials.createRandomKeyFile();
db.credentials.setKeyFile(randomKeyFile);
db.save();
```

##### Creation

```javascript
var newDb = kdbxweb.Kdbx.create(credentials, 'My new db');
var group = newDb.createGroup(newDb.getDefaultGroup(), 'subgroup');
var entry = newDb.createEntry(group);
```

##### Groups
[Group object fields](https://github.com/antelle/kdbxweb/blob/master/lib/format/kdbx-group.js#L14)
```javascript
var defaultGroup = db.getDefaultGroup();
var anotherGroup = db.getGroup(uuid);
var deepGroup = defaultGroup.groups[1].groups[2];
```

##### Group creation
```javascript
var group = db.createGroup(db.getDefaultGroup(), 'New group');
var anotherGroup = db.createGroup(group, 'Subgroup');
```

##### Group deletion
```javascript
db.remove(group, parentGroup);
```

##### Group move
```javascript
db.remove(group, parentGroup, toGroup);
```

##### Recycle Bin
```javascript
var recycleBin = db.getGroup(db.meta.recycleBinUuid);
if (!recycleBin) {
    db.createRecycleBin();
}
```

##### Entries
[Entry object fields](https://github.com/antelle/kdbxweb/blob/master/lib/format/kdbx-entry.js#L16)  
[entry.times](https://github.com/antelle/kdbxweb/blob/master/lib/format/kdbx-times.js#L10)  
```javascript
var entry = db.getDefaultGroup().entries[0];
entry.fields.AccountNumber = '1234 5678';
entry.fields.Pin = kdbxweb.ProtectedValue.fromString('4321');
```

##### Entry creation
```javascript
var entry = db.createEntry(group);
```

##### Entry modification
```javascript
// push current state to history stack
entry.pushHistory();
// change something
entry.fgColor = '#ff0000';
// update entry modification and access time
entry.times.update();
```

##### Entry deletion
```javascript
db.remove(entry, parentGroup);
```

##### Entry move
```javascript
db.remove(entry, parentGroup, toGroup);
```

##### ProtectedValue
Used for passwords and custom fields, stored the value in memory XOR'ed  
```javascript
var value = new kdbxweb.ProtectedValue(xoredByted, saltBytes);
var valueFromString = kdbxweb.ProtectedValue.fromString('str');
var valueFromBinary = kdbxweb.ProtectedValue.fromBinary(data);
var textString = value.getText();
var binaryData = value.getBinary();
var includesSubString = value.includes('foo');
```

##### Errors
```javascript
try {
    kdbxweb.Kdbx.load(data, credentials);
} catch (e) {
    if (e.code === kdbxweb.Consts.ErrorCodes.BadSignature) { /* ... */ }
}
```

##### Consts
[Consts definition](https://github.com/antelle/kdbxweb/blob/master/lib/defs/consts.js)  
```javascript
kdbxweb.Consts.ErrorCodes (all thrown errors have code property)
kdbxweb.Consts.Defaults // default db settings
kdbxweb.Consts.Icons // icons map
```

##### Random
```javascript
var randomArray = kdbxweb.Random.getBytes(/* desired length */ 100);
```

##### ByteUtils
```javascript
kdbxweb.ByteUtils.bytesToString(bytes);
kdbxweb.ByteUtils.stringToBytes(str);
kdbxweb.ByteUtils.bytesToBase64(bytes)
kdbxweb.ByteUtils.base64ToBytes(str);;
```

## Building

Use npm to build this project:  
`> npm run build`  
`> npm run build:debug`  


To run tests:  
`> npm test`  

## Contributing

Areas which need more attention for now: 

- unit tests, especially for complex functions (like moving entry with binaries)
- testing in general
- better documentation
- merge files support

## License

MIT
