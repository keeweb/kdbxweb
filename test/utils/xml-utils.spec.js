'use strict';

var expect = require('expect.js'),
    DomParser = require('xmldom').DOMParser,
    XmlUtils = require('../../lib/utils/xml-utils'),
    Constants = require('../../lib/defs/consts'),
    KdbxError = require('../../lib/errors/kdbx-error');

describe('XmlUtils', function() {
    describe('getChildNode', function() {
        it('gets first child node', function() {
            var xml = new DomParser().parseFromString('<root><item>1</item><item>2</item></root>');
            var childNode = XmlUtils.getChildNode(xml.documentElement, 'item');
            expect(childNode).to.be.ok();
            expect(childNode.textContent).to.be('1');
        });

        it('gets null if there\'s no matching child node', function() {
            var xml = new DomParser().parseFromString('<root><item>1</item><item>2</item></root>');
            var childNode = XmlUtils.getChildNode(xml.documentElement, 'notexisting');
            expect(childNode).to.be(null);
        });

        it('gets null for null', function() {
            var childNode = XmlUtils.getChildNode(null, 'notexisting');
            expect(childNode).to.be(null);
        });

        it('gets null if there\'s no child nodes at all', function() {
            var xml = new DomParser().parseFromString('<root><item/></root>');
            var childNode = XmlUtils.getChildNode(xml.documentElement, 'item');
            expect(childNode).to.be.ok();
            childNode = XmlUtils.getChildNode(childNode, 'notexisting');
            expect(childNode).to.be(null);
        });

        it('throws error if there\'s no matching node', function() {
            var xml = new DomParser().parseFromString('<root><item/></root>');
            expect(function() {
                XmlUtils.getChildNode(xml.documentElement, 'notexisting', 'not found');
            }).to.throwException(function(e) {
                    expect(e).to.be.a(KdbxError);
                    expect(e.code).to.be(Constants.ErrorCodes.FileCorrupt);
                    expect(e.message).to.contain('not found');
                });
        });
    });

    describe('getText', function() {
        it('returns node text', function() {
            var xml = new DomParser().parseFromString('<item> some text </item>');
            var text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be(' some text ');
        });

        it('returns empty string for existing node without content', function() {
            var xml = new DomParser().parseFromString('<item></item>');
            var text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('');
        });

        it('returns empty string for empty node', function() {
            var xml = new DomParser().parseFromString('<item/>');
            var text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('');
        });

        it('returns undefined for not existing node node', function() {
            var text = XmlUtils.getText(null);
            expect(text).to.be(undefined);
        });
    });

    describe('getBytes', function() {
        it('returns node bytes', function() {
            var xml = new DomParser().parseFromString('<item>YWJj</item>');
            var bytes = new Uint8Array(XmlUtils.getBytes(xml.documentElement));
            expect(bytes).to.be.eql(new Uint8Array(['a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0)]));
        });

        it('returns undefined for empty node', function() {
            var xml = new DomParser().parseFromString('<item></item>');
            var bytes = XmlUtils.getBytes(xml.documentElement);
            expect(bytes).to.be(undefined);
        });
    });

    describe('getDate', function() {
        it('returns node date', function() {
            var xml = new DomParser().parseFromString('<item>2015-01-02T03:04:05Z</item>');
            var dt = XmlUtils.getDate(xml.documentElement);
            expect(dt.getUTCFullYear()).to.be(2015);
            expect(dt.getUTCMonth()).to.be(0);
            expect(dt.getUTCDate()).to.be(2);
            expect(dt.getUTCHours()).to.be(3);
            expect(dt.getUTCMinutes()).to.be(4);
            expect(dt.getUTCSeconds()).to.be(5);
        });

        it('returns undefined for empty node', function() {
            var xml = new DomParser().parseFromString('<item></item>');
            var dt = XmlUtils.getDate(xml.documentElement);
            expect(dt).to.be(undefined);
        });
    });

    describe('getNumber', function() {
        it('returns node number', function() {
            var xml = new DomParser().parseFromString('<item>123</item>');
            var num = XmlUtils.getNumber(xml.documentElement);
            expect(num).to.be(123);
        });

        it('returns undefined for empty node', function() {
            var xml = new DomParser().parseFromString('<item></item>');
            var num = XmlUtils.getNumber(xml.documentElement);
            expect(num).to.be(undefined);
        });
    });

    describe('getBoolean', function() {
        it('returns node true', function() {
            var xml = new DomParser().parseFromString('<item>True</item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(true);
        });

        it('returns node false', function() {
            var xml = new DomParser().parseFromString('<item>False</item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(false);
        });

        it('returns undefined for empty node', function() {
            var xml = new DomParser().parseFromString('<item></item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(undefined);
        });
    });

    describe('getUuid', function() {
        it('returns node uuid', function() {
            var xml = new DomParser().parseFromString('<item>hADuI/JGbkmnRZxNNIZDew==</item>');
            var uuid = XmlUtils.getUuid(xml.documentElement);
            expect(uuid).to.be.ok();
            expect(uuid.id).to.be('hADuI/JGbkmnRZxNNIZDew==');
        });

        it('returns undefined for empty node', function() {
            var xml = new DomParser().parseFromString('<item></item>');
            var uuid = XmlUtils.getUuid(xml.documentElement);
            expect(uuid).to.be(undefined);
        });
    });
});