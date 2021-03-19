const kdbxweb = require('../lib');
const argon2 = require('../test/test-support/argon2');

kdbxweb.CryptoEngine.argon2 = argon2;

const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));

const db = kdbxweb.Kdbx.create(credentials, 'test');
db.upgrade();

const time = process.hrtime();
db.save().then(() => {
    const diff = process.hrtime(time);
    const NS_PER_SEC = 1e9;
    const seconds = (diff[0] + diff[1] / NS_PER_SEC).toFixed(3);
    console.log(`Done in ${seconds} seconds`);
});
