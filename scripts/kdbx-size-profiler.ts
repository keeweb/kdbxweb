import * as fs from 'fs';
import {
    Credentials,
    CryptoEngine,
    Kdbx,
    KdbxBinaries,
    KdbxEntry,
    KdbxGroup,
    ProtectedValue
} from '../lib';
import { argon2 } from '../test/test-support/argon2';

CryptoEngine.setArgon2Impl(argon2);

if (process.argv.length < 4) {
    console.log('Usage: npm run script:kdbx-size-profiler path/to-file.kdbx password');
    process.exit(1);
}

const filePath = process.argv[2];
const password = process.argv[3];
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;
const cred = new Credentials(ProtectedValue.fromString(password));

(async () => {
    try {
        const db = await Kdbx.load(file, cred);
        const xml = await db.saveXml(false);
        console.log(`File size: ${file.byteLength} bytes`);
        console.log(`XML: ${xml.length} characters`);

        const binSize = [...db.binaries.getAll().values()]
            .map((b) => b.value.byteLength)
            .reduce((s, v) => s + v, 0);
        console.log(`Binaries: ${binSize} bytes`);

        const iconsSize = [...db.meta.customIcons.values()]
            .map((b) => b.byteLength)
            .reduce((s, v) => s + v, 0);
        console.log(`Custom icons: ${iconsSize} bytes`);

        for (const item of db.getDefaultGroup().allGroupsAndEntries()) {
            if (item instanceof KdbxGroup) {
                console.log(`Group: "${item.name}"`);
            } else {
                printEntry(item);
                for (const histEntry of item.history) {
                    printEntry(histEntry, true);
                }
            }
        }
    } catch (e) {
        console.error('Error', e);
        process.exit(2);
    }

    function printEntry(entry: KdbxEntry, isHistory = false) {
        const fieldsSize = [...entry.fields.values()]
            .map((f) => (typeof f === 'string' ? f.length : f.byteLength))
            .reduce((s, v) => s + v, 0);
        const binSize = [...entry.binaries.values()]
            .map(
                (b) =>
                    (KdbxBinaries.isKdbxBinaryWithHash(b) ? b.value.byteLength : b.byteLength) | 0
            )
            .reduce((s, v) => s + v, 0);

        const type = isHistory ? '  History item' : 'Entry';
        const title = entry.fields.get('Title') || '(no title)';
        let sizeStr = `${fieldsSize} bytes fields`;
        if (binSize) {
            sizeStr += `, ${binSize} bytes binaries`;
        }
        console.log(`  ${type}: "${title}": ${sizeStr}`);
    }
})().catch((e) => console.error(e));
