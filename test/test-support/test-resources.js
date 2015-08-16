'use strict';

var ByteUtils = require('../../lib/utils/byte-utils');

var res = {};

try { res.demoKdbx = require('base64!../../resources/demo.kdbx'); }
catch (e) { res.demoKdbx = readNodeFile('../../resources/demo.kdbx'); }

try { res.demoKey = require('base64!../../resources/demo.key'); }
catch (e) { res.demoKey = readNodeFile('../../resources/demo.key'); }

try { res.cyrillicKdbx = require('base64!../../resources/cyrillic.kdbx'); }
catch (e) { res.cyrillicKdbx = readNodeFile('../../resources/cyrillic.kdbx'); }

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
