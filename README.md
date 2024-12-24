# KdbxWeb ![CI Checks](https://github.com/keeweb/kdbxweb/workflows/CI%20Checks/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/keeweb/kdbxweb/badge.svg?branch=master)](https://coveralls.io/github/keeweb/kdbxweb?branch=master)

KdbxWeb is a high-performance javascript library for reading/writing KeePass v2 databases (kdbx) in node.js or browser.

<br />

---

<br />

- [KdbxWeb  ](#kdbxweb--)
  - [Features](#features)
  - [Browser support](#browser-support)
  - [Compatibility](#compatibility)
  - [Kdbx4](#kdbx4)
  - [Usage](#usage)
    - [Loading](#loading)
    - [Saving](#saving)
    - [File info](#file-info)
    - [Changing credentials](#changing-credentials)
    - [Creation](#creation)
    - [Maintenance](#maintenance)
    - [Merge](#merge)
    - [Groups](#groups)
    - [Group creation](#group-creation)
    - [Group deletion](#group-deletion)
    - [Group move](#group-move)
    - [Recycle Bin](#recycle-bin)
    - [Recursive traverse](#recursive-traverse)
    - [Entries](#entries)
    - [Entry creation](#entry-creation)
    - [Entry modification](#entry-modification)
        - [Entry deletion](#entry-deletion)
    - [Entry move](#entry-move)
    - [ProtectedValue](#protectedvalue)
    - [Errors](#errors)
    - [Consts](#consts)
    - [Random](#random)
    - [ByteUtils](#byteutils)
  - [Building](#building)
  - [3rd party libs](#3rd-party-libs)
  - [Tools](#tools)
  - [See it in action](#see-it-in-action)
  - [Extras](#extras)
  - [License](#license)


<br />

---

<br />

## Features

kdbxweb offers the following feature sets:

- runs in browser or node.js
- no native addons
- fast encryption with WebCrypto
- total ≈130kB with dependencies
- full support of Kdbx features
- protected values are stored in memory XOR'ed
- conflict-free merge support
- high code coverage
- strict TypeScript

<br />

---

<br />

## Browser support

- All modern browsers
  - Chrome / Chromium
  - Firefox
  - Safari
  - Opera
  - Edge
- NodeJS

<br />

---

<br />

## Compatibility

Supported formats are Kdbx3 and Kdbx4, current KeePass file format. Old kdb files (for KeePass v1) are out of scope of this library. We currently have no plans to support the older formats.

<br />

---

<br />

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

It's not compiled into the library because there's no universal way to provide a fast implementation, so it's up to you to choose the best one.

<br />

---

<br />

## Usage

This section gives usage examples on how you can implement kdbxweb into your project.

<br />

### Loading

```ts
let credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'),
    keyFileArrayBuffer, challengeResponseFunction);
const db1 = await kdbxweb.Kdbx.load(dataAsArrayBuffer, credentials);
const db2 = await kdbxweb.Kdbx.loadXml(dataAsString, credentials);
```

### Saving

```ts
const dataAsArrayBuffer = await db.save();
const xmlAsString = await db.saveXml();
```

You can also pretty-print XML:
```ts
const prettyPrintedXml = await db.saveXml(true);
```

<br />

### File info

```ts
db.header
db.meta
```

See the corresponding type fields inside, they should be obvious.

### Changing credentials

```ts
const db = await kdbxweb.Kdbx.load(data, credentials);
db.credentials.setPassword(kdbxweb.ProtectedValue.fromString('newPass'));
const randomKeyFile = await kdbxweb.Credentials.createRandomKeyFile();
db.credentials.setKeyFile(randomKeyFile);
await db.save();
```

### Creation

```ts
let newDb = kdbxweb.Kdbx.create(credentials, 'My new db');
let group = newDb.createGroup(newDb.getDefaultGroup(), 'subgroup');
let entry = newDb.createEntry(group);
```

<br />

### Maintenance

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

<br />

### Merge

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

<br />

### Groups

```ts
let defaultGroup = db.getDefaultGroup();
let anotherGroup = db.getGroup(uuid);
let deepGroup = defaultGroup.groups[1].groups[2];
```

<br />

### Group creation

```ts
let group = db.createGroup(db.getDefaultGroup(), 'New group');
let anotherGroup = db.createGroup(group, 'Subgroup');
```

<br />

### Group deletion

```ts
db.remove(group);
```

<br />

### Group move

```ts
db.move(group, toGroup);
db.move(group, toGroup, atIndex);
```

<br />

### Recycle Bin

```ts
let recycleBin = db.getGroup(db.meta.recycleBinUuid);
if (!recycleBin) {
    db.createRecycleBin();
}
```

<br />

### Recursive traverse

```ts
for (const entry of group.allEntries()) { /* ... */ }
for (const group of group.allGroups()) { /* ... */ }
for (const entryOrGroup of group.allGroupsAndEntries()) { /* ... */ }
```

<br />

### Entries

```ts
let entry = db.getDefaultGroup().entries[0];
entry.fields.AccountNumber = '1234 5678';
entry.fields.Pin = kdbxweb.ProtectedValue.fromString('4321');
```

<br />

### Entry creation

```ts
let entry = db.createEntry(group);
```

<br />

### Entry modification

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

<br />

> [!WARNING]
> Do **not** modify history states directly; this will break merge.

<br />

##### Entry deletion

```ts
db.remove(entry);
```

<br />

### Entry move

```ts
db.move(entry, toGroup);
```

If you're moving an entry from another file, this is called _import_:

```ts
db.importEntry(entry, toGroup, sourceFile);
```

<br />

### ProtectedValue

Used for passwords and custom fields, stored the value in memory XOR'ed

```ts
let value = new kdbxweb.ProtectedValue(xoredByted, saltBytes);
let valueFromString = kdbxweb.ProtectedValue.fromString('str');
let valueFromBinary = kdbxweb.ProtectedValue.fromBinary(data);
let textString = value.getText();
let binaryData = value.getBinary();
let includesSubString = value.includes('foo');
```

<br />

### Errors

```ts
try {
    await kdbxweb.Kdbx.load(data, credentials);
} catch (e) {
    if (e instanceof kdbxweb.KdbxError && e.code === kdbxweb.Consts.ErrorCodes.BadSignature) {
        /* ... */
    }
}
```

<br />

### Consts

[Consts definition](https://github.com/keeweb/kdbxweb/blob/master/lib/defs/consts.ts)  

```ts
kdbxweb.Consts.ErrorCodes // all thrown errors have code property
kdbxweb.Consts.Defaults // default db settings
kdbxweb.Consts.Icons // icons map
```

<br />

### Random

```ts
let randomArray = kdbxweb.Crypto.random(/* desired length */ 100);
```

<br />

### ByteUtils

```ts
kdbxweb.ByteUtils.bytesToString(bytes);
kdbxweb.ByteUtils.stringToBytes(str);
kdbxweb.ByteUtils.bytesToBase64(bytes);
kdbxweb.ByteUtils.base64ToBytes(str);
kdbxweb.ByteUtils.bytesToHex(bytes);
kdbxweb.ByteUtils.hexToBytes(str);
```

<br />

---

<br />

## Building

> [!NOTE]
> This project requires node v18.18.0.

<br />

Use npm to build this project:

```sh
npm run build
```  

<br />

To run tests:

```sh
npm test
```  

<br />

---

<br />

## 3rd party libs

kdbxweb includes these 3rd party libraries:
- [fflate](https://github.com/101arrowz/fflate)
- [xmldom](https://github.com/xmldom/xmldom)

<br />

---

<br />

## Tools

The library provides a number of scripts to work with KDBX files:

Dump the binary header:

```sh
npm run script:dump-header my-db.kdbx
```

<br />

Print detailed size information about internal objects:

```sh
npm run script:kdbx-size-profiler my-db.kdbx password
```

<br />

Dump the internal XML:

```sh
npm run script:kdbx-to-xml my-db.kdbx password
```

<br />

Generate big files for load testing:

```sh
npm run script:make-big-files
```

<br />

---

<br />

## See it in action

This library is used in **[KeeWeb](https://app.keeweb.info)**

<br />

---

<br />

## Extras

We also provide a template for **[HexFiend](https://github.com/ridiculousfish/HexFiend)** to explore the contents of KDBX files, you can find it **[here](format)**.

<br />

---

<br />

## License

MIT
