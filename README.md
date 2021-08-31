# KdbxWeb ![CI Checks](https://github.com/keeweb/kdbxweb/workflows/CI%20Checks/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/keeweb/kdbxweb/badge.svg?branch=master)](https://coveralls.io/github/keeweb/kdbxweb?branch=master)

KdbxWeb is a high-performance javascript library for reading/writing KeePass v2 databases (kdbx) in node.js or browser.

## Features

- runs in browser or node.js
- no native addons
- fast encryption with WebCrypto
- total ≈130kB with dependencies
- full support of Kdbx features
- protected values are stored in memory XOR'ed
- conflict-free merge support
- high code coverage
- strict TypeScript

## Browser support

- modern browsers: Chrome, Firefox, Safari, Opera, Edge
- node.js

## Compatibility

Supported formats are Kdbx3 and Kdbx4, current KeePass file format. Old kdb files (for KeePass v1) are out of scope of this library.

## Kdbx4

Kdbx4 has introduced Argon2, a new hashing function. Due to complex calculations, you have to implement it manually and export to kdbxweb, if you want to support such files. Here's how:

```ts
kdbxweb.CryptoEngine.setArgon2Impl((password, salt,
    memory, iterations, length, parallelism, type, version
) => {
    // your implementation makes hash (Uint8Array, 'length' bytes)
    return Promise.resolve(hash);
});
```

You can find an implementation example in [tests](https://github.com/keeweb/kdbxweb/blob/master/test/test-support/argon2.ts).  

It's not compiled into the library because there's no universal way to provide a fast implementation, so it's up to you, to choose the best one.

## Usage

##### Loading

```ts
let credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'),
    keyFileArrayBuffer, challengeResponseFunction);
const db1 = await kdbxweb.Kdbx.load(dataAsArrayBuffer, credentials);
const db2 = await kdbxweb.Kdbx.loadXml(dataAsString, credentials);
```

##### Saving

```ts
const dataAsArrayBuffer = await db.save();
const xmlAsString = await db.saveXml();
```

You can also pretty-print XML:
```ts
const prettyPrintedXml = await db.saveXml(true);
```

##### File info
```ts
db.header
db.meta
```

See the corresponding type fields inside, they should be obvious.

##### Changing credentials
```ts
const db = await kdbxweb.Kdbx.load(data, credentials);
db.credentials.setPassword(kdbxweb.ProtectedValue.fromString('newPass'));
const randomKeyFile = await kdbxweb.Credentials.createRandomKeyFile();
db.credentials.setKeyFile(randomKeyFile);
await db.save();
```

##### Creation

```ts
let newDb = kdbxweb.Kdbx.create(credentials, 'My new db');
let group = newDb.createGroup(newDb.getDefaultGroup(), 'subgroup');
let entry = newDb.createEntry(group);
```

##### Maintenance

```ts
db.cleanup({
    historyRules: true,
    customIcons: true,
    binaries: true
});

// upgrade the db to latest version (currently KDBX4)
db.upgrade();

// downgrade to KDBX3
db.setVersion(3);

// set KDF to AES
db.setKdf(kdbxweb.Consts.KdfId.Aes);
```

##### Merge

Entries, groups and meta are consistent against merging in any direction with any state.  
Due to format limitations, p2p entry history merging and some non-critical fields in meta can produce phantom records or deletions, 
so correct entry history merging is supported only with one central replica. Items order is not guaranteed but the algorithm tries to preserve it.
```ts
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
let pushedOk = pushToUpstream(saved); // push db to upstream
if (pushedOk) {
    db.removeLocalEditState(); // clear local editing state
    editStateBeforeSave = null; // and discard it
}
```

##### Groups
```ts
let defaultGroup = db.getDefaultGroup();
let anotherGroup = db.getGroup(uuid);
let deepGroup = defaultGroup.groups[1].groups[2];
```

##### Group creation
```ts
let group = db.createGroup(db.getDefaultGroup(), 'New group');
let anotherGroup = db.createGroup(group, 'Subgroup');
```

##### Group deletion
```ts
db.remove(group);
```

##### Group move
```ts
db.move(group, toGroup);
db.move(group, toGroup, atIndex);
```

##### Recycle Bin
```ts
let recycleBin = db.getGroup(db.meta.recycleBinUuid);
if (!recycleBin) {
    db.createRecycleBin();
}
```

##### Recursive traverse
```ts
for (const entry of group.allEntries()) { /* ... */ }
for (const group of group.allGroups()) { /* ... */ }
for (const entryOrGroup of group.allGroupsAndEntries()) { /* ... */ }
```

##### Entries
```ts
let entry = db.getDefaultGroup().entries[0];
entry.fields.AccountNumber = '1234 5678';
entry.fields.Pin = kdbxweb.ProtectedValue.fromString('4321');
```

##### Entry creation
```ts
let entry = db.createEntry(group);
```

##### Entry modification
```ts
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
```ts
db.remove(entry);
```

##### Entry move
```ts
db.move(entry, toGroup);
```

If you're moving an entry from another file, this is called _import_:
```ts
db.importEntry(entry, toGroup, sourceFile);
```

##### ProtectedValue
Used for passwords and custom fields, stored the value in memory XOR'ed  
```ts
let value = new kdbxweb.ProtectedValue(xoredByted, saltBytes);
let valueFromString = kdbxweb.ProtectedValue.fromString('str');
let valueFromBinary = kdbxweb.ProtectedValue.fromBinary(data);
let textString = value.getText();
let binaryData = value.getBinary();
let includesSubString = value.includes('foo');
```

##### Errors
```ts
try {
    await kdbxweb.Kdbx.load(data, credentials);
} catch (e) {
    if (e instanceof kdbxweb.KdbxError && e.code === kdbxweb.Consts.ErrorCodes.BadSignature) {
        /* ... */
    }
}
```

##### Consts
[Consts definition](https://github.com/keeweb/kdbxweb/blob/master/lib/defs/consts.ts)  
```ts
kdbxweb.Consts.ErrorCodes // all thrown errors have code property
kdbxweb.Consts.Defaults // default db settings
kdbxweb.Consts.Icons // icons map
```

##### Random
```ts
let randomArray = kdbxweb.Crypto.random(/* desired length */ 100);
```

##### ByteUtils
```ts
kdbxweb.ByteUtils.bytesToString(bytes);
kdbxweb.ByteUtils.stringToBytes(str);
kdbxweb.ByteUtils.bytesToBase64(bytes);
kdbxweb.ByteUtils.base64ToBytes(str);
kdbxweb.ByteUtils.bytesToHex(bytes);
kdbxweb.ByteUtils.hexToBytes(str);
```

## Building

Use npm to build this project:  
```sh
npm run build
```  

To run tests:  
```sh
npm test
```  

## 3rd party libs

kdbxweb includes these 3rd party libraries:
- [fflate](https://github.com/101arrowz/fflate)
- [xmldom](https://github.com/xmldom/xmldom)

## Tools

The library provides a number of scripts to work with KDBX files:

Dump the binary header:
```sh
npm run script:dump-header my-db.kdbx
```

Print detailed size information about internal objects:
```sh
npm run script:kdbx-size-profiler my-db.kdbx password
```

Dump the internal XML:
```sh
npm run script:kdbx-to-xml my-db.kdbx password
```

Generate big files for load testing:
```sh
npm run script:make-big-files
```

## See it in action

This library is used in [KeeWeb](https://app.keeweb.info)

## Extras

We also provide a template for [HexFiend](https://github.com/ridiculousfish/HexFiend)
to explore the contents of KDBX files, you can find it
[here](format).

## License

MIT
