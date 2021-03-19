/* eslint-disable no-console */

const fs = require('fs');

const kdbxweb = require('../lib');

if (process.argv.length < 4) {
    console.log('Usage: node kdbx-size-profiler.js path/to-file.kdbx password');
    process.exit(1);
}

const filePath = process.argv[2];
const password = process.argv[3];
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;
const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));

kdbxweb.Kdbx.load(file, cred)
    .then((db) => {
        const binSize = Object.values(db.binaries)
            .map((b) => b.byteLength)
            .reduce((s, v) => s + v, 0);
        console.log(`Binaries: ${binSize} bytes`);

        db.getDefaultGroup().forEach((entry) => {
            if (entry) {
                printEntry(entry);
                for (const histEntry of entry.history) {
                    printEntry(histEntry, true);
                }
            }
        });
    })
    .catch((e) => {
        console.error('Error', e);
        process.exit(2);
    });

function printEntry(entry, isHistory) {
    const fieldsSize = Object.values(entry.fields)
        .map((f) => f.length || f.byteLength || 0)
        .reduce((s, v) => s + v, 0);
    const ebinSize = Object.values(entry.binaries)
        .map((b) => (b.value && b.value.byteLength) || 0)
        .reduce((s, v) => s + v, 0);
    console.log(
        `${isHistory ? 'history ' : ''}entry: "${
            entry.fields.Title
        }": ${fieldsSize} bytes fields, ${ebinSize} bytes binaries`
    );
}
