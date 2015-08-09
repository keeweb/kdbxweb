# KdbxWeb

KdbxWeb is a high-performance javascript library for reading/writing KeePass v2 databases (kdbx) in node.js or browser.

# Alpha Version

Not production-ready, the project is under development 

## Features

- runs in browser or node.js
- no native addons
- average file open time is 100-200ms
- total &lt;150kB with dependencies

## Browser support

- modern browsers: IE10+, Firefox, Chrome, Safari 5.1+, Opera
- node.js

## Usage

```javascript
var db = Kdbx.load(file, password, keyFile);
```

## Building

Use npm to build this project:  
`> npm run build`  
`> npm run build:debug`  


To run tests:  
`> npm test`  

## License

MIT
