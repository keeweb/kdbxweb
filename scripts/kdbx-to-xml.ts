import * as fs from 'fs';
import { Credentials, CryptoEngine, Kdbx, ProtectedValue } from '../lib';
import { argon2 } from '../test/test-support/argon2';

CryptoEngine.setArgon2Impl(argon2);

if (process.argv.length < 4) {
    console.log('Usage: npm run script:kdbx-to-xml path/to-file.kdbx password');
    process.exit(1);
}

const filePath = process.argv[2];
const password = process.argv[3];
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;
const cred = new Credentials(ProtectedValue.fromString(password));

Kdbx.load(file, cred)
    .then((db) => {
        return db.saveXml(true).then((xml) => {
            fs.writeFileSync(filePath + '.xml', xml);
            console.log('Done, written', filePath + '.xml');
        });
    })
    .catch((e) => {
        console.error('Error', e);
        process.exit(2);
    });
