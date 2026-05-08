import expect from 'expect.js';
import * as kdbxweb from '../../lib';
import { Kdbx, KdbxContext, KdbxCustomData, KdbxCustomDataItem, XmlUtils } from '../../lib';
import { TestResources } from '../test-support/test-resources';

const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T/;

function makeKdbx41(): { kdbx: Kdbx; ctx: KdbxContext } {
    const kdbx = new Kdbx();
    kdbx.header.versionMajor = 4;
    kdbx.header.versionMinor = 1;
    const ctx = new KdbxContext({ kdbx });
    return { kdbx, ctx };
}

function getLastModTime(serialized: string): string | null {
    const m = serialized.match(/<LastModificationTime>([^<]*)<\/LastModificationTime>/);
    return m ? m[1] : null;
}

describe('KdbxCustomData', () => {
    const kdbx = new Kdbx();
    const ctx = new KdbxContext({ kdbx });

    it('reads custom data from xml', () => {
        const xml = XmlUtils.parse(
            '<CustomData>' +
                '<Item><Key>k1</Key><Value>v1</Value></Item>' +
                '<Item><Key>k2</Key><Value>v2</Value></Item>' +
                '</CustomData>'
        );
        const cd = KdbxCustomData.read(xml.documentElement);
        expect([...cd.entries()]).to.eql([
            ['k1', { value: 'v1' }],
            ['k2', { value: 'v2' }]
        ]);
    });

    it('reads empty custom data from empty xml', () => {
        const xml = XmlUtils.parse('<CustomData></CustomData>');
        const cd = KdbxCustomData.read(xml.documentElement);
        expect(cd).to.eql({});
    });

    it('skips unknown tags', () => {
        const xml = XmlUtils.parse(
            '<CustomData><Item><Key>k</Key><Value>v</Value><x></x></Item><Something></Something></CustomData>'
        );
        const cd = KdbxCustomData.read(xml.documentElement);
        expect([...cd.entries()]).to.eql([['k', { value: 'v' }]]);
    });

    it('skips empty keys', () => {
        const xml = XmlUtils.parse(
            '<CustomData><Item><Key></Key><Value>v</Value></Item></CustomData>'
        );
        const cd = KdbxCustomData.read(xml.documentElement);
        expect(cd).to.eql({});
    });

    it('writes custom data to xml', () => {
        const xml = XmlUtils.create('root');
        KdbxCustomData.write(
            xml.documentElement,
            ctx,
            new Map([
                ['k1', { value: 'v1' }],
                ['k2', { value: 'v2' }]
            ])
        );
        expect(XmlUtils.serialize(<Document>(<unknown>xml.documentElement))).to.eql(
            '<root><CustomData>' +
                '<Item><Key>k1</Key><Value>v1</Value></Item>' +
                '<Item><Key>k2</Key><Value>v2</Value></Item>' +
                '</CustomData></root>'
        );
    });

    it('writes empty custom data to xml', () => {
        const xml = XmlUtils.create('root');
        KdbxCustomData.write(xml.documentElement, ctx, new Map());
        expect(
            XmlUtils.serialize(<Document>(<unknown>xml.documentElement)).replace(/\s/g, '')
        ).to.eql('<root><CustomData/></root>');
    });

    it('does not create tag for empty custom data', () => {
        const xml = XmlUtils.create('root');
        KdbxCustomData.write(xml.documentElement, ctx, undefined);
        expect(
            XmlUtils.serialize(<Document>(<unknown>xml.documentElement)).replace(/\s/g, '')
        ).to.eql('<root/>');
    });

    it('skips keys without values', () => {
        const xml = XmlUtils.create('root');
        KdbxCustomData.write(
            xml.documentElement,
            ctx,
            new Map<string, KdbxCustomDataItem>([
                ['k1', { value: 'v1' }],
                ['k2', { value: '' }],
                ['k3', { value: undefined }]
            ])
        );
        expect(XmlUtils.serialize(<Document>(<unknown>xml.documentElement))).to.eql(
            '<root><CustomData>' +
                '<Item><Key>k1</Key><Value>v1</Value></Item>' +
                '</CustomData></root>'
        );
    });

    describe('KDBX 4.1 — lastModified encoding (unit)', () => {
        it('writes lastModified as Base64 binary for KDBX 4.1 binary save', () => {
            // Arrange
            const { ctx: ctx41 } = makeKdbx41();
            const xml = XmlUtils.create('root');
            const testDate = new Date('2021-01-20T18:10:44.000Z');

            // Act
            KdbxCustomData.write(
                xml.documentElement,
                ctx41,
                new Map([['k', { value: 'v', lastModified: testDate }]])
            );
            const serialized = XmlUtils.serialize(xml.documentElement as unknown as Document);
            const lastModTime = getLastModTime(serialized);

            // Assert — must be Base64 (8 bytes → 12 chars), never an ISO date string
            expect(lastModTime).to.be.ok();
            expect(BASE64_RE.test(lastModTime!)).to.be(true);
            expect(ISO_DATE_RE.test(lastModTime!)).to.be(false);
        });

        it('roundtrips lastModified correctly for KDBX 4.1', () => {
            // Arrange
            const { ctx: ctx41 } = makeKdbx41();
            const xml = XmlUtils.create('root');
            const testDate = new Date('2021-01-20T18:10:44.000Z');
            KdbxCustomData.write(
                xml.documentElement,
                ctx41,
                new Map([['k', { value: 'v', lastModified: testDate }]])
            );

            // Act
            const result = KdbxCustomData.read(xml.documentElement.firstChild!);

            // Assert
            expect(result.get('k')!.lastModified).to.eql(testDate);
        });

        it('does not write lastModified for KDBX 4.0', () => {
            // Arrange
            const xml = XmlUtils.create('root');
            const testDate = new Date('2021-01-20T18:10:44.000Z');

            // Act
            KdbxCustomData.write(
                xml.documentElement,
                ctx,
                new Map([['k', { value: 'v', lastModified: testDate }]])
            );
            const serialized = XmlUtils.serialize(xml.documentElement as unknown as Document);

            // Assert
            expect(serialized).not.to.contain('LastModificationTime');
        });
    });

    describe('KDBX 4.1 — lastModified encoding (integration)', () => {
        // The bug: KdbxCustomData.write() calls XmlUtils.setDate() without the
        // binary=true flag, writing an ISO string instead of Base64 binary.
        // KeePass / KeePassXC reject the file with "Invalid Base-64 string".
        // kdbxweb itself is lenient and reads both formats, so a plain
        // save/reload roundtrip would not surface the issue.
        //
        // This test loads a real KDBX 4.1 file, writes its custom data using
        // a binary-save context (exportXml=false), and checks the raw encoding.
        it('writes LastModificationTime as Base64 binary when saving real KDBX 4.1 file', async () => {
            // Arrange
            const cred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString('test'));
            const db = await kdbxweb.Kdbx.load(TestResources.kdbx41, cred);
            const binaryCtx = new KdbxContext({ kdbx: db });
            const xml = XmlUtils.create('root');

            // Act — write custom data as binary save would (exportXml=false)
            KdbxCustomData.write(xml.documentElement, binaryCtx, db.meta.customData);
            const serialized = XmlUtils.serialize(xml.documentElement as unknown as Document);
            const allLastModTimes: string[] = [];
            const re = /<LastModificationTime>([^<]+)<\/LastModificationTime>/g;
            let m: RegExpExecArray | null;
            while ((m = re.exec(serialized)) !== null) {
                allLastModTimes.push(m[1]);
            }

            // Assert — all values must be Base64 binary, never ISO strings
            expect(allLastModTimes.length).to.be.greaterThan(0);
            expect(allLastModTimes.every((v) => BASE64_RE.test(v))).to.be(true);
            expect(allLastModTimes.some((v) => ISO_DATE_RE.test(v))).to.be(false);
        });
    });
});
