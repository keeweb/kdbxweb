const fs = require('fs');

const kdbxweb = require('../lib');

kdbxweb.CryptoEngine.argon2 = require('../test/test-support/argon2');

if (process.argv.length < 4) {
    console.log('Usage: node kdbx-to-xml.js path/to-file.kdbx password');
    process.exit(1);
}

const filePath = process.argv[2];
const password = process.argv[3];
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;
const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));

kdbxweb.Kdbx.load(file, cred)
    .then((db) => {
        return db.saveXml(true).then((xml) => {
            fs.writeFileSync(filePath + '.xml', xml);
        });
    })
    .catch((e) => {
        console.error('Error', e);
        process.exit(2);
    });
