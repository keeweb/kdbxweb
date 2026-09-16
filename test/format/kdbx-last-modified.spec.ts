import expect from 'expect.js';
import {
    ByteUtils,
    Consts,
    Credentials,
    Kdbx,
    KdbxContext,
    ProtectedValue,
    XmlUtils
} from '../../lib';

describe('KDBX 4.1 last modification time encoding', () => {
    const lastModified = new Date('2021-01-20T18:10:44.000Z');
    // 63746763044 seconds since 0001-01-01, encoded as eight little-endian bytes.
    const binaryDate = 'JGma1w4AAAA=';
    const xmlDate = '2021-01-20T18:10:44Z';
    const iconId = 'EREREREREREREREREREREQ==';
    const containers = ['CustomData', 'CustomIcons'];

    function addMetadata(db: Kdbx): void {
        db.meta.customData.set('encoding-regression', { value: 'test', lastModified });
        db.meta.customIcons.set(iconId, {
            data: ByteUtils.arrayToBuffer(
                ByteUtils.base64ToBytes(
                    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/' +
                        'x8AAwMCAO+ip1sAAAAASUVORK5CYII='
                )
            ),
            name: 'encoding-regression',
            lastModified
        });
    }

    function getTimes(xml: Document, containerName: string) {
        const container = xml.getElementsByTagName(containerName).item(0);
        expect(container).to.be.ok();
        return container!.getElementsByTagName('LastModificationTime');
    }

    function expectTime(xml: Document, containerName: string, expected: string): void {
        const times = getTimes(xml, containerName);
        expect(times.length).to.be(1);
        expect(times.item(0)!.textContent).to.be(expected);
    }

    for (const containerName of containers) {
        describe(containerName, () => {
            for (const exportXml of [false, true]) {
                it(`writes the correct timestamp for exportXml=${exportXml}`, () => {
                    const db = new Kdbx();
                    db.header.versionMajor = 4;
                    db.header.versionMinor = 1;
                    addMetadata(db);
                    const xml = XmlUtils.create('KeePassFile');

                    db.meta.write(xml.documentElement, new KdbxContext({ kdbx: db, exportXml }));

                    expectTime(xml, containerName, exportXml ? xmlDate : binaryDate);
                });
            }

            for (const [major, minor] of [
                [3, 1],
                [4, 0]
            ]) {
                it(`omits unsupported timestamps in KDBX ${major}.${minor}`, () => {
                    const db = new Kdbx();
                    db.header.versionMajor = major;
                    db.header.versionMinor = minor;
                    addMetadata(db);
                    const xml = XmlUtils.create('KeePassFile');

                    db.meta.write(xml.documentElement, new KdbxContext({ kdbx: db }));

                    expect(getTimes(xml, containerName).length).to.be(0);
                });
            }
        });
    }

    function createDatabase(): Kdbx {
        const credentials = new Credentials(ProtectedValue.fromString('regression-test-only'));
        const db = Kdbx.create(credentials, 'KDBX 4.1 encoding regression');
        db.setVersion(4);
        db.header.versionMinor = 1;
        db.setKdf(Consts.KdfId.Aes);
        addMetadata(db);
        return db;
    }

    it('writes binary timestamps through the public save API', async () => {
        const db = createDatabase();

        const data = await db.save();
        const saved = await Kdbx.load(data, db.credentials, { preserveXml: true });

        expect(saved.versionMajor).to.be(4);
        expect(saved.versionMinor).to.be(1);
        expect(saved.meta.customData.get('encoding-regression')!.lastModified).to.eql(lastModified);
        expect(saved.meta.customIcons.get(iconId)!.lastModified).to.eql(lastModified);
        expect(saved.xml).to.be.ok();
        for (const containerName of containers) {
            // The reader accepts both encodings, so checking the parsed date alone is insufficient.
            expectTime(saved.xml!, containerName, binaryDate);
        }
    });

    it('keeps textual timestamps through the public XML export API', async () => {
        const db = createDatabase();

        const text = await db.saveXml();
        const xml = XmlUtils.parse(text);

        for (const containerName of containers) {
            expectTime(xml, containerName, xmlDate);
        }
    });
});
