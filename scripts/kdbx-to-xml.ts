import * as fs from 'fs';
import { Credentials, CryptoEngine, Kdbx, ProtectedValue, XmlUtils } from '../lib';
import { argon2 } from '../test/test-support/argon2';

CryptoEngine.setArgon2Impl(argon2);

if (process.argv.length < 4) {
    console.log('Usage: npm run script:kdbx-to-xml path/to-file.kdbx password');
    console.log('To make an XML that can be imported, add "-- --importable" after password');
    process.exit(1);
}

const filePath = process.argv[2];
const password = process.argv[3];
const importable = process.argv.includes('--importable');
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;
const cred = new Credentials(ProtectedValue.fromString(password));

(async () => {
    const db = await Kdbx.load(file, cred, { preserveXml: true });
    if (!db.xml) {
        throw new Error('XML not read');
    }
    let xml: string;
    if (importable) {
        xml = await db.saveXml(true);
    } else {
        xml = XmlUtils.serialize(db.xml);
    }
    fs.writeFileSync(filePath + '.xml', xml);
    console.log('Done, written', filePath + '.xml');
    console.log(
        "WARNING: the XML contains raw passwords as well as other data, don't paste it anywhere!"
    );
    if (importable) {
        console.log('This XML can be imported in applications compatible with KeePass.');
    } else {
        console.log(
            "The generated XML is a raw XML from your database, if you import it, passwords won't match. " +
                'If you would like to generate an XML file suitable for import, add "-- --importable" after your password: ' +
                'npm run script:kdbx-to-xml path/to-file.kdbx password -- --importable'
        );
    }
})().catch((e) => {
    console.error('Error', e);
    process.exit(2);
});
