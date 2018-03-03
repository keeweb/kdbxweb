# KdbxWeb [![Build status](https://travis-ci.org/keeweb/kdbxweb.svg?branch=master)](https://travis-ci.org/keeweb/kdbxweb) [![Coverage Status](https://coveralls.io/repos/github/keeweb/kdbxweb/badge.svg?branch=master)](https://coveralls.io/github/keeweb/kdbxweb?branch=master)

KdbxWeb is a high-performance javascript library for reading/writing KeePass v2 databases (kdbx) in node.js or browser.

## Features

- runs in browser or node.js
- no native addons
- fast encryption with WebCrypto
- total ≈150kB with dependencies
- full support of Kdbx features
- protected values are stored in memory XOR'ed
- conflict-free merge support
- high code coverage

## Browser support

- modern browsers: Chrome, Firefox, Safari, Opera, Edge
- node.js

## Compatibility

Supported formats are Kdbx3 and Kdbx4, current KeePass file format. Old kdb files (for KeePass v1) are out of scope of this library.

## Kdbx4

Kdbx4 has introduced Argon2, a new hashing function. Due to complex calculations, you have to implement it manually and export to kdbxweb, if you want to support such files. Here's how:

```javascript
const argon2 = require('your-argon2-impl');
kdbxweb.CryptoEngine.argon2 = argon2;
```

You can find implementation example in [tests](https://github.com/keeweb/kdbxweb/blob/master/test/test-support/argon2.js).  

It's not compiled into the library because there's no universal way to provide a fast implementation, so it's up to you, to choose the best one.

## Usage

##### Loading

```javascript
let credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFileArrayBuffer);
kdbxweb.Kdbx.load(dataAsArrayBuffer, credentials).then(db => ...);
kdbxweb.Kdbx.loadXml(dataAsString, credentials).then(db => ...);
```

##### Saving

```javascript
db.save().then(dataAsArrayBuffer => ...);
db.saveXml().then(xmlAsString => ...);
```

##### File info
[Header object fields](https://github.com/keeweb/kdbxweb/blob/master/lib/format/kdbx-header.js#L26)  
[Meta object fields](https://github.com/keeweb/kdbxweb/blob/master/lib/format/kdbx-meta.js#L15)  
```javascript
db.header
db.meta
```

##### Changing credentials
```javascript
kdbxweb.Kdbx.load(data, credentials).then(db => {
    db.credentials.setPassword(kdbxweb.ProtectedValue.fromString('newPass'));
    let randomKeyFile = kdbxweb.Credentials.createRandomKeyFile();
    db.credentials.setKeyFile(randomKeyFile);
    db.save();
});
```

##### Creation

```javascript
let newDb = kdbxweb.Kdbx.create(credentials, 'My new db');
let group = newDb.createGroup(newDb.getDefaultGroup(), 'subgroup');
let entry = newDb.createEntry(group);
```

##### Maintenance

```javascript
db.cleanup({
    historyRules: true,
    customIcons: true,
    binaries: true
});

// upgrade the db to latest version (kdbx4 format)
db.upgrade();
```

##### Merge

Entries, groups and meta are consistent against merging in any direction with any state.  
Due to format limitations, p2p entry history merging and some non-critical fields in meta can produce phantom records or deletions, 
so correct entry history merging is supported only with one central replica. Items order is not guaranteed but the algorithm tries to preserve it.
```javascript
let db = await kdbxweb.Kdbx.load(data, credentials); // load local db
// work with db
db.save(); // save local db
let editStateBeforeSave = db.getLocalEditState(); // save local editing state (serializable to JSON)
db.close(); // close local db
db = kdbxweb.Kdbx.load(data, credentials); // reopen it again
db.setLocalEditState(editStateBeforeSave); // assign edit state obtained before save
// work with db
let remoteDb = await kdbxweb.Kdbx.load(remoteData, credentials); // load remote db
db.merge(remoteDb); // merge remote into local
delete remoteDb; // don't use remoteDb anymore
let saved = await db.save(); // save local db
editStateBeforeSave = db.getLocalEditState(); // save local editing state again
let pushedOk = pushToUpstream(saved); { // push db to upstream
if (pushedOk) {
    db.removeLocalEditState(); // clear local editing state
    editStateBeforeSave = null; // and discard it
}
```

##### Groups
[Group object fields](https://github.com/keeweb/kdbxweb/blob/master/lib/format/kdbx-group.js#L14)
```javascript
let defaultGroup = db.getDefaultGroup();
let anotherGroup = db.getGroup(uuid);
let deepGroup = defaultGroup.groups[1].groups[2];
```

##### Group creation
```javascript
let group = db.createGroup(db.getDefaultGroup(), 'New group');
let anotherGroup = db.createGroup(group, 'Subgroup');
```

##### Group deletion
```javascript
db.remove(group);
```

##### Group move
```javascript
db.move(group, toGroup);
db.move(group, toGroup, atIndex);
```

##### Recycle Bin
```javascript
let recycleBin = db.getGroup(db.meta.recycleBinUuid);
if (!recycleBin) {
    db.createRecycleBin();
}
```

##### Recursive traverse
```javascript
group.forEach((entry, group) => { /* will be called for each entry or group */ });
```

##### Entries
[Entry object fields](https://github.com/keeweb/kdbxweb/blob/master/lib/format/kdbx-entry.js#L16)  
[Entry.times fields](https://github.com/keeweb/kdbxweb/blob/master/lib/format/kdbx-times.js#L10)  
```javascript
let entry = db.getDefaultGroup().entries[0];
entry.fields.AccountNumber = '1234 5678';
entry.fields.Pin = kdbxweb.ProtectedValue.fromString('4321');
```

##### Entry creation
```javascript
let entry = db.createEntry(group);
```

##### Entry modification
```javascript
// push current state to history stack
entry.pushHistory();
// change something
entry.fgColor = '#ff0000';
// update entry modification and access time
entry.times.update();
// remove states from entry history
entry.removeHistory(index, count);
```
Important: don't modify history states directly, this will break merge.

##### Entry deletion
```javascript
db.remove(entry);
```

##### Entry move
```javascript
db.move(entry, toGroup);
```

##### ProtectedValue
Used for passwords and custom fields, stored the value in memory XOR'ed  
```javascript
let value = new kdbxweb.ProtectedValue(xoredByted, saltBytes);
let valueFromString = kdbxweb.ProtectedValue.fromString('str');
let valueFromBinary = kdbxweb.ProtectedValue.fromBinary(data);
let textString = value.getText();
let binaryData = value.getBinary();
let includesSubString = value.includes('foo');
```

##### Errors
```javascript
kdbxweb.Kdbx.load(data, credentials).then(...)
    .catch(e => {
        if (e.code === kdbxweb.Consts.ErrorCodes.BadSignature) { /* ... */ }
    });
```

##### Consts
[Consts definition](https://github.com/keeweb/kdbxweb/blob/master/lib/defs/consts.js)  
```javascript
kdbxweb.Consts.ErrorCodes // all thrown errors have code property
kdbxweb.Consts.Defaults // default db settings
kdbxweb.Consts.Icons // icons map
```

##### Random
```javascript
let randomArray = kdbxweb.Random.getBytes(/* desired length */ 100);
```

##### ByteUtils
```javascript
kdbxweb.ByteUtils.bytesToString(bytes);
kdbxweb.ByteUtils.stringToBytes(str);
kdbxweb.ByteUtils.bytesToBase64(bytes);
kdbxweb.ByteUtils.base64ToBytes(str);
kdbxweb.ByteUtils.bytesToHex(bytes);
kdbxweb.ByteUtils.hexToBytes(str);
```

## Building

Use npm to build this project:  
`> npm run build`  
`> npm run build:debug`  


To run tests:  
`> npm test`  

## 3rd party libs

kdbxweb includes these 3rd party libraries:
- [pako](https://github.com/nodeca/pako) ([fork](https://github.com/keeweb/pako))
- [text-encoding](https://github.com/inexorabletash/text-encoding) ([fork](https://github.com/keeweb/text-encoding))
- [xmldom](https://github.com/jindw/xmldom) ([fork](https://github.com/keeweb/xmldom))

## See it in action

This library is used in [KeeWeb](https://app.keeweb.info)

## License

MIT
