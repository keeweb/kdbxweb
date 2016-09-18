'use strict';

var expect = require('expect.js'),
    XmlUtils = require('../../lib/utils/xml-utils'),
    KdbxCustomData = require('../../lib/format/kdbx-custom-data');

describe('KdbxCustomData', function() {
    it('reads custom data from xml', function() {
        var xml = XmlUtils.parse('<CustomData>' +
            '<Item><Key>k1</Key><Value>v1</Value></Item>' +
            '<Item><Key>k2</Key><Value>v2</Value></Item>' +
            '</CustomData>');
        var cd = KdbxCustomData.read(xml.documentElement);
        expect(cd).to.eql({ k1: 'v1', k2: 'v2' });
    });

    it('reads empty custom data from empty xml', function() {
        var xml = XmlUtils.parse('<CustomData></CustomData>');
        var cd = KdbxCustomData.read(xml.documentElement);
        expect(cd).to.eql({});
    });

    it('skips unknown tags', function() {
        var xml = XmlUtils.parse('<CustomData><Item><Key>k</Key><Value>v</Value><x></x></Item><Something></Something></CustomData>');
        var cd = KdbxCustomData.read(xml.documentElement);
        expect(cd).to.eql({ k: 'v' });
    });

    it('skips empty keys', function() {
        var xml = XmlUtils.parse('<CustomData><Item><Key></Key><Value>v</Value></Item></CustomData>');
        var cd = KdbxCustomData.read(xml.documentElement);
        expect(cd).to.eql({});
    });

    it('writes custom data to xml', function() {
        var xml = XmlUtils.create('root');
        KdbxCustomData.write(xml.documentElement, { k1: 'v1', k2: 'v2' });
        expect(XmlUtils.serialize(xml.documentElement)).to.eql('<root><CustomData>' +
            '<Item><Key>k1</Key><Value>v1</Value></Item>' +
            '<Item><Key>k2</Key><Value>v2</Value></Item>' +
            '</CustomData></root>');
    });

    it('writes empty custom data to xml', function() {
        var xml = XmlUtils.create('root');
        KdbxCustomData.write(xml.documentElement, { });
        expect(XmlUtils.serialize(xml.documentElement).replace(/\s/g, '')).to.eql('<root><CustomData/></root>');
    });

    it('does not create tag for null custom data', function() {
        var xml = XmlUtils.create('root');
        KdbxCustomData.write(xml.documentElement, null);
        expect(XmlUtils.serialize(xml.documentElement).replace(/\s/g, '')).to.eql('<root/>');
    });

    it('skips keys without values', function() {
        var xml = XmlUtils.create('root');
        KdbxCustomData.write(xml.documentElement, { k1: 'v1', k2: '', k3: null, k4: undefined });
        expect(XmlUtils.serialize(xml.documentElement)).to.eql('<root><CustomData>' +
            '<Item><Key>k1</Key><Value>v1</Value></Item>' +
            '</CustomData></root>');
    });
});
