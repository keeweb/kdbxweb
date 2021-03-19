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

(async () => {
    try {
        const db = await kdbxweb.Kdbx.load(file, cred);
        const xml = await db.saveXml(false);
        console.log(`File size: ${file.byteLength} bytes`);
        console.log(`XML: ${xml.length} characters`);

        const binSize = Object.values(db.binaries)
            .map((b) => b.byteLength)
            .reduce((s, v) => s + v, 0);
        console.log(`Binaries: ${binSize} bytes`);

        const iconsSize = Object.values(db.meta.customIcons)
            .map((b) => b.byteLength)
            .reduce((s, v) => s + v, 0);
        console.log(`Custom icons: ${iconsSize} bytes`);

        db.getDefaultGroup().forEach((entry) => {
            if (entry) {
                printEntry(entry);
                for (const histEntry of entry.history) {
                    printEntry(histEntry, true);
                }
            }
        });
    } catch (e) {
        console.error('Error', e);
        process.exit(2);
    }

    function printEntry(entry, isHistory) {
        const fieldsSize = Object.values(entry.fields)
            .map((f) => f.length || f.byteLength || 0)
            .reduce((s, v) => s + v, 0);
        const binSize = Object.values(entry.binaries)
            .map((b) => (b.value && b.value.byteLength) || 0)
            .reduce((s, v) => s + v, 0);

        const type = isHistory ? '  History item' : 'Entry';
        const title = entry.fields.Title || '(no title)';
        let sizeStr = `${fieldsSize} bytes fields`;
        if (binSize) {
            sizeStr += `, ${binSize} bytes binaries`;
        }
        console.log(`${type}: "${title}": ${sizeStr}`);
    }
})();
