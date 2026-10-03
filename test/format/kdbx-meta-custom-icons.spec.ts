import expect from 'expect.js';
import { Kdbx, KdbxContext, KdbxMeta, KdbxUuid, XmlUtils } from '../../lib';

const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T/;
const ICON_DATA = new Uint8Array([137, 80, 78, 71]).buffer; // PNG magic bytes

function makeKdbx41(): { kdbx: Kdbx; ctx: KdbxContext } {
    const kdbx = new Kdbx();
    kdbx.header.versionMajor = 4;
    kdbx.header.versionMinor = 1;
    const ctx = new KdbxContext({ kdbx });
    return { kdbx, ctx };
}

function getCustomIconLastModTimes(serialized: string): string[] {
    const times: string[] = [];
    const re = /<LastModificationTime>([^<]+)<\/LastModificationTime>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(serialized)) !== null) {
        times.push(m[1]);
    }
    return times;
}

describe('KdbxMeta — custom icons LastModificationTime encoding', () => {
    describe('KDBX 4.1 — lastModified encoding (unit)', () => {
        it('writes custom icon lastModified as Base64 binary for KDBX 4.1 binary save', () => {
            // Arrange
            const { kdbx, ctx } = makeKdbx41();
            const testDate = new Date('2021-01-20T18:10:44.000Z');
            const iconId = KdbxUuid.random().id;
            kdbx.meta.customIcons.set(iconId, {
                data: ICON_DATA,
                name: 'test',
                lastModified: testDate
            });
            const xml = XmlUtils.create('root');

            // Act
            kdbx.meta.write(xml.documentElement, ctx);
            const serialized = XmlUtils.serialize(xml.documentElement as unknown as Document);
            const times = getCustomIconLastModTimes(serialized);

            // Assert — must be Base64 (8 bytes → 12 chars), never an ISO date string
            expect(times.length).to.be(1);
            expect(BASE64_RE.test(times[0])).to.be(true);
            expect(ISO_DATE_RE.test(times[0])).to.be(false);
        });

        it('roundtrips custom icon lastModified correctly for KDBX 4.1', () => {
            // Arrange
            const { kdbx, ctx } = makeKdbx41();
            const testDate = new Date('2021-01-20T18:10:44.000Z');
            const iconId = KdbxUuid.random().id;
            kdbx.meta.customIcons.set(iconId, { data: ICON_DATA, lastModified: testDate });
            const xml = XmlUtils.create('root');
            kdbx.meta.write(xml.documentElement, ctx);

            // Act — read the written XML back via KdbxMeta
            const resultMeta = new KdbxMeta();
            const metaNode = xml.documentElement.firstChild as Element;
            for (let i = 0; i < metaNode.childNodes.length; i++) {
                const child = metaNode.childNodes[i] as Element;
                // trigger readCustomIcons indirectly via the public read path
                if (child.tagName === 'CustomIcons') {
                    (resultMeta as any).readCustomIcons(child);
                    break;
                }
            }

            // Assert
            const icon = [...resultMeta.customIcons.values()][0];
            expect(icon?.lastModified).to.eql(testDate);
        });

        it('does not write lastModified for KDBX 4.0', () => {
            // Arrange
            const kdbx = new Kdbx();
            const ctx = new KdbxContext({ kdbx });
            const testDate = new Date('2021-01-20T18:10:44.000Z');
            const iconId = KdbxUuid.random().id;
            kdbx.meta.customIcons.set(iconId, { data: ICON_DATA, lastModified: testDate });
            const xml = XmlUtils.create('root');

            // Act
            kdbx.meta.write(xml.documentElement, ctx);
            const serialized = XmlUtils.serialize(xml.documentElement as unknown as Document);

            // Assert
            expect(serialized).not.to.contain('LastModificationTime');
        });
    });
});
