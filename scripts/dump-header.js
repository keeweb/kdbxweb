const fs = require('fs');

const Kdbx = require('../lib/format/kdbx');
const KdbxContext = require('../lib/format/kdbx-context');
const KdbxHeader = require('../lib/format/kdbx-header');
const KdbxUuid = require('../lib/format/kdbx-uuid');
const BinaryStream = require('../lib/utils/binary-stream');
const ByteUtils = require('../lib/utils/byte-utils');
const VarDictionary = require('../lib/utils/var-dictionary');
const Int64 = require('../lib/utils/int64');

if (process.argv.length < 3) {
    console.log('Usage: node dump-header.js path/to-file.kdbx');
    process.exit(1);
}

const filePath = process.argv[2];
const file = new Uint8Array(fs.readFileSync(filePath)).buffer;

const kdbx = new Kdbx();
const ctx = new KdbxContext({ kdbx });
const stm = new BinaryStream(file);
const header = KdbxHeader.read(stm, ctx);

const stringRep = {};
for (const [field, value] of Object.entries(header)) {
    stringRep[field] = valueToStr(value);
}

fs.writeFileSync(filePath + '.header.json', JSON.stringify(stringRep, null, 4));

function valueToStr(value) {
    if (value instanceof ArrayBuffer) {
        return ByteUtils.bytesToBase64(value);
    } else if (value instanceof KdbxUuid) {
        return value.toString();
    } else if (value instanceof Int64) {
        return value.value;
    } else if (value instanceof VarDictionary) {
        const obj = {};
        for (const key of value.keys()) {
            obj[key] = valueToStr(value.get(key));
        }
        return obj;
    } else {
        return value;
    }
}
