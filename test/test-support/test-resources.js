'use strict';

var ByteUtils = require('../../lib/utils/byte-utils');

var res = {};

try { res.demoKdbx = require('base64!../../resources/demo.kdbx'); }
catch (e) { res.demoKdbx = readNodeFile('../../resources/demo.kdbx'); }

try { res.demoKey = require('base64!../../resources/demo.key'); }
catch (e) { res.demoKey = readNodeFile('../../resources/demo.key'); }

try { res.demoXml = require('base64!../../resources/demo.xml'); }
catch (e) { res.demoXml = readNodeFile('../../resources/demo.xml'); }

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

try { res.key32 = require('base64!../../resources/Key32.kdbx'); }
catch (e) { res.key32 = readNodeFile('../../resources/Key32.kdbx'); }

try { res.key32KeyFile = require('base64!../../resources/Key32.key'); }
catch (e) { res.key32KeyFile = readNodeFile('../../resources/Key32.key'); }

try { res.key64 = require('base64!../../resources/Key64.kdbx'); }
catch (e) { res.key64 = readNodeFile('../../resources/Key64.kdbx'); }

try { res.key64KeyFile = require('base64!../../resources/Key64.key'); }
catch (e) { res.key64KeyFile = readNodeFile('../../resources/Key64.key'); }

try { res.keyWithBom = require('base64!../../resources/KeyWithBom.kdbx'); }
catch (e) { res.keyWithBom = readNodeFile('../../resources/KeyWithBom.kdbx'); }

try { res.keyWithBomKeyFile = require('base64!../../resources/KeyWithBom.key'); }
catch (e) { res.keyWithBomKeyFile = readNodeFile('../../resources/KeyWithBom.key'); }

try { res.argon2 = require('base64!../../resources/Argon2.kdbx'); }
catch (e) { res.argon2 = readNodeFile('../../resources/Argon2.kdbx'); }

try { res.argon2ChaCha = require('base64!../../resources/Argon2ChaCha.kdbx'); }
catch (e) { res.argon2ChaCha = readNodeFile('../../resources/Argon2ChaCha.kdbx'); }

try { res.aesChaCha = require('base64!../../resources/AesChaCha.kdbx'); }
catch (e) { res.aesChaCha = readNodeFile('../../resources/AesChaCha.kdbx'); }

try { res.aesKdfKdbx4 = require('base64!../../resources/AesKdfKdbx4.kdbx'); }
catch (e) { res.aesKdfKdbx4 = readNodeFile('../../resources/AesKdfKdbx4.kdbx'); }

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
