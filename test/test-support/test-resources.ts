import { ByteUtils } from '../../lib';

export const TestResources = {
    demoKdbx: readFile('demo.kdbx'),
    demoKey: readFile('demo.key'),
    demoXml: readFile('demo.xml'),
    cyrillicKdbx: readFile('cyrillic.kdbx'),
    binKeyKdbx: readFile('binkey.kdbx'),
    binKeyKey: readFile('binkey.key'),
    emptyPass: readFile('EmptyPass.kdbx'),
    emptyPassWithKeyFile: readFile('EmptyPassWithKeyFile.kdbx'),
    emptyPassWithKeyFileKey: readFile('EmptyPassWithKeyFile.key'),
    noPassWithKeyFile: readFile('NoPassWithKeyFile.kdbx'),
    noPassWithKeyFileKey: readFile('NoPassWithKeyFile.key'),
    key32: readFile('Key32.kdbx'),
    key32KeyFile: readFile('Key32.key'),
    key64: readFile('Key64.kdbx'),
    key64KeyFile: readFile('Key64.key'),
    keyWithBom: readFile('KeyWithBom.kdbx'),
    keyWithBomKeyFile: readFile('KeyWithBom.key'),
    keyV2: readFile('KeyV2.kdbx'),
    keyV2KeyFile: readFile('KeyV2.keyx'),
    argon2: readFile('Argon2.kdbx'),
    argon2id: readFile('Argon2id.kdbx'),
    argon2ChaCha: readFile('Argon2ChaCha.kdbx'),
    aesChaCha: readFile('AesChaCha.kdbx'),
    aesKdfKdbx4: readFile('AesKdfKdbx4.kdbx'),
    yubikey3: readFile('YubiKey3.kdbx'),
    yubikey4: readFile('YubiKey4.kdbx'),
    emptyUuidXml: readFile('empty-uuid.xml'),
    kdbx41: readFile('KDBX4.1.kdbx')
};

function readFile(name: string) {
    let content;
    try {
        content = require('base64-loader!../../resources/' + name);
    } catch (e) {
        content = readNodeFile('../../resources/' + name);
    }
    content = ByteUtils.arrayToBuffer(ByteUtils.base64ToBytes(content));
    return content;
}

function readNodeFile(filePath: string): Buffer {
    return require('fs').readFileSync(require('path').join(__dirname, filePath), 'base64');
}
