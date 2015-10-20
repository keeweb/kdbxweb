# KdbxWeb [![Build status](https://travis-ci.org/antelle/kdbxweb.svg?branch=master)](https://travis-ci.org/antelle/kdbxweb) [![Coverage Status](https://coveralls.io/repos/antelle/kdbxweb/badge.svg?branch=master&service=github)](https://coveralls.io/github/antelle/kdbxweb?branch=master)

KdbxWeb is a high-performance javascript library for reading/writing KeePass v2 databases (kdbx) in node.js or browser.

## Features

- runs in browser or node.js
- no native addons
- average file open time is 200ms
- total ≈150kB with dependencies
- full support of Kdbx features
- protected values are stored in memory encrypted

## Browser support

- modern browsers: IE10+, Firefox, Chrome, Safari 7+, Opera
- node.js

## Usage

```javascript
var credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('demo'), keyFileArrayBuffer);
var db = kdbxweb.Kdbx.load(data, credentials);
var data = db.save();

var newDb = kdbxweb.Kdbx.create(credentials, 'My new db');
var group = newDb.createGroup(newDb.getDefaultGroup(), 'subgroup');
var entry = newDb.createEntry(group);
var newData = newDb.save();
```

## Building

Use npm to build this project:  
`> npm run build`  
`> npm run build:debug`  


To run tests:  
`> npm test`  

## License

MIT
