'use strict';

var ByteUtils = require('../../lib/utils/byte-utils');

var res = {};

try { res.demoKdbx = require('base64!../../resources/demo.kdbx'); }
catch (e) { res.demoKdbx = readNodeFile('../../resources/demo.kdbx'); }

try { res.demoKey = require('base64!../../resources/demo.key'); }
catch (e) { res.demoKey = readNodeFile('../../resources/demo.key'); }

try { res.cyrillicKdbx = require('base64!../../resources/cyrillic.kdbx'); }
catch (e) { res.cyrillicKdbx = readNodeFile('../../resources/cyrillic.kdbx'); }

try { res.binKeyKdbx = require('base64!../../resources/binkey.kdbx'); }
catch (e) { res.binKeyKdbx = readNodeFile('../../resources/binkey.kdbx'); }

try { res.binKeyKey = require('base64!../../resources/binkey.key'); }
catch (e) { res.binKeyKey = readNodeFile('../../resources/binkey.key'); }

try { res.emptyPass = require('base64!../../resources/EmptyPass.kdbx'); }
catch (e) { res.emptyPass = readNodeFile('../../resources/EmptyPass.kdbx'); }

try { res.emptyPassWithKeyFile = require('base64!../../resources/EmptyPassWithKeyFile.kdbx'); }
catch (e) { res.emptyPassWithKeyFile = readNodeFile('../../resources/EmptyPassWithKeyFile.kdbx'); }

try { res.emptyPassWithKeyFileKey = require('base64!../../resources/EmptyPassWithKeyFile.key'); }
catch (e) { res.emptyPassWithKeyFileKey = readNodeFile('../../resources/EmptyPassWithKeyFile.key'); }

try { res.noPassWithKeyFile = require('base64!../../resources/NoPassWithKeyFile.kdbx'); }
catch (e) { res.noPassWithKeyFile = readNodeFile('../../resources/NoPassWithKeyFile.kdbx'); }

try { res.noPassWithKeyFileKey = require('base64!../../resources/NoPassWithKeyFile.key'); }
catch (e) { res.noPassWithKeyFileKey = readNodeFile('../../resources/NoPassWithKeyFile.key'); }

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
