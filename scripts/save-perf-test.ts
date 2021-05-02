import { Credentials, CryptoEngine, Kdbx, ProtectedValue } from '../lib';
import { argon2 } from '../test/test-support/argon2';

CryptoEngine.setArgon2Impl(argon2);

const credentials = new Credentials(ProtectedValue.fromString(''));

const db = Kdbx.create(credentials, 'test');
db.upgrade();

const time = process.hrtime();
db.save()
    .then(() => {
        const diff = process.hrtime(time);
        const NS_PER_SEC = 1e9;
        const seconds = (diff[0] + diff[1] / NS_PER_SEC).toFixed(3);
        console.log(`Done in ${seconds} seconds`);
    })
    .catch((e) => console.error(e));
