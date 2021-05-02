import * as fs from 'fs';
import {
    Kdbx,
    KdbxUuid,
    VarDictionary,
    Int64,
    ByteUtils,
    BinaryStream,
    KdbxContext,
    KdbxHeader
} from '../lib';

if (process.argv.length < 3) {
    console.log('Usage: npm run script:dump-header path/to-file.kdbx');
    process.exit(1);
}

const filePath = process.argv[2];
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;

const kdbx = new Kdbx();
const ctx = new KdbxContext({ kdbx });
const stm = new BinaryStream(file);
const header = KdbxHeader.read(stm, ctx);

for (const [field, value] of Object.entries(header)) {
    console.log(`${field}:`, presentValue(value));
}

function presentValue(value: any): any {
    if (value instanceof ArrayBuffer) {
        return ByteUtils.bytesToBase64(value);
    } else if (value instanceof KdbxUuid) {
        return value.toString();
    } else if (value instanceof Int64) {
        return value.value;
    } else if (value instanceof VarDictionary) {
        const obj: { [name: string]: any } = {};
        for (const key of value.keys()) {
            obj[key] = presentValue(value.get(key));
        }
        return obj;
    } else {
        return value;
    }
}
