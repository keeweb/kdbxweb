import expect from 'expect.js';
import { KdbxCustomData, XmlUtils } from '../../lib';

describe('KdbxCustomData', () => {
    it('reads custom data from xml', () => {
        const xml = XmlUtils.parse(
            '<CustomData>' +
                '<Item><Key>k1</Key><Value>v1</Value></Item>' +
                '<Item><Key>k2</Key><Value>v2</Value></Item>' +
                '</CustomData>'
        );
        const cd = KdbxCustomData.read(xml.documentElement);
        expect([...cd.entries()]).to.eql([
            ['k1', 'v1'],
            ['k2', 'v2']
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
        expect([...cd.entries()]).to.eql([['k', 'v']]);
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
            new Map([
                ['k1', 'v1'],
                ['k2', 'v2']
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
        KdbxCustomData.write(xml.documentElement, new Map());
        expect(
            XmlUtils.serialize(<Document>(<unknown>xml.documentElement)).replace(/\s/g, '')
        ).to.eql('<root><CustomData/></root>');
    });

    it('does not create tag for empty custom data', () => {
        const xml = XmlUtils.create('root');
        KdbxCustomData.write(xml.documentElement, undefined);
        expect(
            XmlUtils.serialize(<Document>(<unknown>xml.documentElement)).replace(/\s/g, '')
        ).to.eql('<root/>');
    });

    it('skips keys without values', () => {
        const xml = XmlUtils.create('root');
        KdbxCustomData.write(
            xml.documentElement,
            new Map<string, string | null>([
                ['k1', 'v1'],
                ['k2', ''],
                ['k3', null]
            ])
        );
        expect(XmlUtils.serialize(<Document>(<unknown>xml.documentElement))).to.eql(
            '<root><CustomData>' +
                '<Item><Key>k1</Key><Value>v1</Value></Item>' +
                '</CustomData></root>'
        );
    });
});
