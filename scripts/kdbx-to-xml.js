const fs = require('fs');
const child_process = require('child_process');

const kdbxweb = require('../lib');
const XmlUtils = require('../lib/utils/xml-utils');

if (process.argv.length < 4) {
    console.log('Usage: node kdbx-to-xml.js path/to-file.kdbx password');
    process.exit(1);
}

const filePath = process.argv[2];
const password = process.argv[3];
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;
const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));

kdbxweb.Kdbx.load(file, cred).then(db => {
    const xml = XmlUtils.serialize(db.xml);
    const ps = child_process.spawnSync('xmllint', ['--format', '-'], { input: xml });
    const xmlStr = ps.output[1].toString();
    fs.writeFileSync(filePath + '.xml', xmlStr);
}).catch(e => {
    console.error('Error', e);
    process.exit(2);
});
