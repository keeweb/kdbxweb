# KdbxWeb [![Build status](https://travis-ci.org/antelle/kdbxweb.svg?branch=master)](https://travis-ci.org/antelle/kdbxweb) [![Coverage Status](https://coveralls.io/repos/antelle/kdbxweb/badge.svg?branch=master&service=github)](https://coveralls.io/github/antelle/kdbxweb?branch=master)

KdbxWeb is a high-performance javascript library for reading/writing KeePass v2 databases (kdbx) in node.js or browser.

# Alpha Version

Not production-ready, the project is under development 

## Features

- runs in browser or node.js
- no native addons
- average file open time is 200ms
- total ≈150kB with dependencies
- full support of Kdbx features
- protected values are stored in memory encrypted

## Browser support

- modern browsers: IE10+, Firefox, Chrome, Safari 5.1+, Opera
- node.js

## Usage

```javascript
var db = kdbxweb.Kdbx.load(data, kdbxweb.ProtectedValue.fromString('demo'));
var data = db.save();
```

## Building

Use npm to build this project:  
`> npm run build`  
`> npm run build:debug`  


To run tests:  
`> npm test`  

## License

MIT
