'use strict';

var ByteUtils = require('../../lib/utils/byte-utils');

var res = {};

try { res.sample = require('base64!../../resources/sample.kdbx'); }
catch (e) { res.sample = readNodeFile('../../resources/sample.kdbx'); }

for (var file in res) {
    if (res.hasOwnProperty(file)) {
        var content = res[file];
        res[file] = ByteUtils.arrayToBuffer(ByteUtils.base64ToBytes(content));
    }
}

function readNodeFile(filePath) {
    return require('fs').readFileSync(require('path').join(__dirname, filePath), 'base64');
}

module.exports = res;
