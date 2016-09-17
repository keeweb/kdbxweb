'use strict';

var expect = require('expect.js'),
    KdbxUuid = require('../../lib/format/kdbx-uuid'),
    ProtectedValue = require('../../lib/crypto/protected-value'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    XmlUtils = require('../../lib/utils/xml-utils'),
    Constants = require('../../lib/defs/consts'),
    KdbxError = require('../../lib/errors/kdbx-error');

describe('XmlUtils', function() {
    function removeSpaces(str) {
        return str.replace(/\s/g, '');
    }

    describe('parse', function() {
        it('parses XML document', function() {
            var xml = XmlUtils.parse('<root><item><cd>&lt;&gt;</cd></item></root>');
            expect(xml.documentElement.nodeName).to.be('root');
            expect(xml.documentElement.firstChild.nodeName).to.be('item');
            expect(xml.documentElement.firstChild.firstChild.nodeName).to.be('cd');
            expect(xml.documentElement.firstChild.firstChild.textContent).to.be('<>');
        });

        it('throws error for non-xml document', function() {
            expect(function() {
                XmlUtils.parse('err');
            }).to.throwException(function(e) {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Constants.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
        });

        it('throws error for malformed xml document', function() {
            expect(function() {
                XmlUtils.parse('<root><item><cd>&lt;&gt;</cd></item></bad>');
            }).to.throwException(function(e) {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Constants.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
        });

        it('throws error for generated parseerror element', function() {
            expect(function() {
                XmlUtils.parse('<root><parsererror/></root>');
            }).to.throwException(function(e) {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Constants.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
        });
    });

    describe('serialize', function() {
        it('serializes XML document', function() {
            var doc = XmlUtils.parse('<root><item><cd>123</cd></item></root>');
            var xml = XmlUtils.serialize(doc);
            expect(xml).to.be('<root><item><cd>123</cd></item></root>');
        });
    });

    describe('create', function() {
        it('creates XML document', function() {
            var doc = XmlUtils.create('root');
            expect(doc.documentElement.nodeName).to.be('root');
        });
    });

    describe('getChildNode', function() {
        it('gets first child node', function() {
            var xml = XmlUtils.parse('<root><item>1</item><item>2</item></root>');
            var childNode = XmlUtils.getChildNode(xml.documentElement, 'item');
            expect(childNode).to.be.ok();
            expect(childNode.textContent).to.be('1');
        });

        it('gets null if there\'s no matching child node', function() {
            var xml = XmlUtils.parse('<root><item>1</item><item>2</item></root>');
            var childNode = XmlUtils.getChildNode(xml.documentElement, 'notexisting');
            expect(childNode).to.be(null);
        });

        it('gets null for null', function() {
            var childNode = XmlUtils.getChildNode(null, 'notexisting');
            expect(childNode).to.be(null);
        });

        it('gets null if there\'s no child nodes at all', function() {
            var xml = XmlUtils.parse('<root><item/></root>');
            var childNode = XmlUtils.getChildNode(xml.documentElement, 'item');
            expect(childNode).to.be.ok();
            childNode = XmlUtils.getChildNode(childNode, 'notexisting');
            expect(childNode).to.be(null);
        });

        it('throws error if there\'s no matching node', function() {
            var xml = XmlUtils.parse('<root><item/></root>');
            expect(function() {
                XmlUtils.getChildNode(xml.documentElement, 'notexisting', 'not found');
            }).to.throwException(function(e) {
                    expect(e).to.be.a(KdbxError);
                    expect(e.code).to.be(Constants.ErrorCodes.FileCorrupt);
                    expect(e.message).to.contain('not found');
                });
        });
    });

    describe('addChildNode', function() {
        it('adds child node and returns it', function () {
            var xml = XmlUtils.parse('<root><old/></root>');
            var childNode = XmlUtils.addChildNode(xml.documentElement, 'item');
            XmlUtils.addChildNode(childNode, 'inner');
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<root><old/><item><inner/></item></root>');
        });
    });

    describe('getText', function() {
        it('returns node text', function() {
            var xml = XmlUtils.parse('<item> some text </item>');
            var text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be(' some text ');
        });

        it('returns empty string for existing node without content', function() {
            var xml = XmlUtils.parse('<item></item>');
            var text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('');
        });

        it('returns empty string for empty node', function() {
            var xml = XmlUtils.parse('<item/>');
            var text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('');
        });

        it('returns undefined for not existing node node', function() {
            var text = XmlUtils.getText(null);
            expect(text).to.be(undefined);
        });

        it('returns node protected value if any', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            xml.documentElement.protectedValue = { text: 'pr' };
            var text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('pr');
        });
    });

    describe('setText', function() {
        it('sets node text', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setText(xml.documentElement, 'new');
            expect(XmlUtils.serialize(xml)).to.be('<item>new</item>');
        });

        it('sets node empty text', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setText(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setText(xml.documentElement, null);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });

        it('escapes special characters', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setText(xml.documentElement, ']]>');
            expect(XmlUtils.serialize(xml)).to.be('<item>]]&gt;</item>');
        });
    });

    describe('getBytes', function() {
        it('returns node bytes', function() {
            var xml = XmlUtils.parse('<item>YWJj</item>');
            var bytes = new Uint8Array(XmlUtils.getBytes(xml.documentElement));
            expect(bytes).to.be.eql(new Uint8Array(['a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0)]));
        });

        it('returns undefined for empty node', function() {
            var xml = XmlUtils.parse('<item></item>');
            var bytes = XmlUtils.getBytes(xml.documentElement);
            expect(bytes).to.be(undefined);
        });
    });

    describe('setBytes', function() {
        it('sets node bytes from array', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBytes(xml.documentElement, new Uint8Array([1, 2, 3]));
            expect(XmlUtils.serialize(xml)).to.be('<item>AQID</item>');
        });

        it('sets node bytes from base64 string', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBytes(xml.documentElement, 'AQID');
            expect(XmlUtils.serialize(xml)).to.be('<item>AQID</item>');
        });

        it('sets node empty bytes', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBytes(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setBytes(xml.documentElement, null);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setBytes(xml.documentElement, '');
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setBytes(xml.documentElement, new Uint8Array(0));
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('setDate', function() {
        it('sets node date in ISO format', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setDate(xml.documentElement, new Date('2015-08-17T21:20Z'));
            expect(XmlUtils.serialize(xml)).to.be('<item>2015-08-17T21:20:00Z</item>');
        });

        it('sets node date in binary format', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setDate(xml.documentElement, new Date('2015-08-16T14:45:23.000Z'), true);
            expect(XmlUtils.serialize(xml)).to.be('<item>A5lizQ4AAAA=</item>');
        });

        it('sets node empty date', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setDate(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setDate(xml.documentElement, null);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setDate(xml.documentElement, '');
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getDate', function() {
        it('returns node date', function() {
            var xml = XmlUtils.parse('<item>2015-01-02T03:04:05Z</item>');
            var dt = XmlUtils.getDate(xml.documentElement);
            expect(dt.getUTCFullYear()).to.be(2015);
            expect(dt.getUTCMonth()).to.be(0);
            expect(dt.getUTCDate()).to.be(2);
            expect(dt.getUTCHours()).to.be(3);
            expect(dt.getUTCMinutes()).to.be(4);
            expect(dt.getUTCSeconds()).to.be(5);
        });

        it('returns node date from base64', function() {
            var xml = XmlUtils.parse('<item>A5lizQ4AAAA=</item>');
            var dt = XmlUtils.getDate(xml.documentElement);
            expect(dt.toISOString()).to.be('2015-08-16T14:45:23.000Z');
        });

        it('returns undefined for empty node', function() {
            var xml = XmlUtils.parse('<item></item>');
            var dt = XmlUtils.getDate(xml.documentElement);
            expect(dt).to.be(undefined);
        });
    });

    describe('getNumber', function() {
        it('returns node number', function() {
            var xml = XmlUtils.parse('<item>123</item>');
            var num = XmlUtils.getNumber(xml.documentElement);
            expect(num).to.be(123);
        });

        it('returns undefined for empty node', function() {
            var xml = XmlUtils.parse('<item></item>');
            var num = XmlUtils.getNumber(xml.documentElement);
            expect(num).to.be(undefined);
        });
    });

    describe('setNumber', function() {
        it('sets node number', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setNumber(xml.documentElement, 1);
            expect(XmlUtils.serialize(xml)).to.be('<item>1</item>');
        });

        it('sets zero as node number', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setNumber(xml.documentElement, 0);
            expect(XmlUtils.serialize(xml)).to.be('<item>0</item>');
        });

        it('sets node empty number', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setNumber(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setNumber(xml.documentElement, null);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setNumber(xml.documentElement, '');
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setNumber(xml.documentElement, NaN);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getBoolean', function() {
        it('returns node true', function() {
            var xml = XmlUtils.parse('<item>True</item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(true);
            xml = XmlUtils.parse('<item>true</item>');
            bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(true);
        });

        it('returns node false', function() {
            var xml = XmlUtils.parse('<item>False</item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(false);
            xml = XmlUtils.parse('<item>false</item>');
            bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(false);
        });

        it('returns undefined for unknown text', function() {
            var xml = XmlUtils.parse('<item>blablabla</item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(undefined);
        });

        it('returns null for null', function() {
            var xml = XmlUtils.parse('<item>null</item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(null);
        });

        it('returns undefined for empty node', function() {
            var xml = XmlUtils.parse('<item></item>');
            var bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(undefined);
        });
    });

    describe('setBoolean', function() {
        it('sets node false', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, false);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item>False</item>');
            XmlUtils.setBoolean(xml.documentElement, NaN);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item>False</item>');
            XmlUtils.setBoolean(xml.documentElement, '');
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item>False</item>');
            XmlUtils.setBoolean(xml.documentElement, 0);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item>False</item>');
        });

        it('sets node true', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, true);
            expect(XmlUtils.serialize(xml)).to.be('<item>True</item>');
        });

        it('sets node null', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, null);
            expect(XmlUtils.serialize(xml)).to.be('<item>null</item>');
        });

        it('sets node empty boolean', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getUuid', function() {
        it('returns node uuid', function() {
            var xml = XmlUtils.parse('<item>hADuI/JGbkmnRZxNNIZDew==</item>');
            var uuid = XmlUtils.getUuid(xml.documentElement);
            expect(uuid).to.be.ok();
            expect(uuid.id).to.be('hADuI/JGbkmnRZxNNIZDew==');
        });

        it('returns undefined for empty node', function() {
            var xml = XmlUtils.parse('<item></item>');
            var uuid = XmlUtils.getUuid(xml.documentElement);
            expect(uuid).to.be(undefined);
        });
    });

    describe('setUuid', function() {
        it('sets node uuid', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setUuid(xml.documentElement, new KdbxUuid(new ArrayBuffer(16)));
            expect(XmlUtils.serialize(xml)).to.be('<item>AAAAAAAAAAAAAAAAAAAAAA==</item>');
        });

        it('sets node empty uuid', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setUuid(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getProtectedText', function() {
        it('returns node protected text', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            xml.documentElement.protectedValue = 'pv';
            var res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be('pv');
        });

        it('returns node text as protected text', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            var res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be('text');
        });

        it('returns empty string as protected text for node without text', function() {
            var xml = XmlUtils.parse('<item></item>');
            var res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be('');
        });

        it('returns empty string as protected text for empty node', function() {
            var xml = XmlUtils.parse('<item></item>');
            var res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be('');
        });
    });

    describe('setProtectedText', function() {
        it('sets node protected text as protected value', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            var pv = ProtectedValue.fromString('str');
            XmlUtils.setProtectedText(xml.documentElement, pv);
            expect(XmlUtils.serialize(xml)).to.be('<item Protected="True">text</item>');
            expect(xml.documentElement.protectedValue).to.be(pv);
        });

        it('sets node protected text as text', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedText(xml.documentElement, 'str');
            expect(XmlUtils.serialize(xml)).to.be('<item>str</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });
    });

    describe('getProtectedBinary', function() {
        it('returns node protected binary', function() {
            var xml = XmlUtils.parse('<item>YWJj</item>');
            xml.documentElement.protectedValue = 'pv';
            var res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(res).to.be('pv');
        });

        it('returns node ref as protected binary', function() {
            var xml = XmlUtils.parse('<item Ref="MyRef">YWJj</item>');
            var res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(res).to.be.eql({ ref: 'MyRef' });
        });

        it('returns undefined as protected binary', function() {
            var xml = XmlUtils.parse('<item></item>');
            var res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(res).to.be(undefined);
        });

        it('returns node text as protected binary', function() {
            var xml = XmlUtils.parse('<item>YWJj</item>');
            var res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(ByteUtils.bytesToString(res)).to.be('abc');
        });

        it('decompresses node text as protected binary', function() {
            var xml = XmlUtils.parse('<item Compressed="True">H4sIAAAAAAAAA0tMSgYAwkEkNQMAAAA=</item>');
            var res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(ByteUtils.bytesToString(res)).to.be('abc');
        });
    });

    describe('setProtectedBinary', function() {
        it('sets node protected binary as protected value', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            var pv = ProtectedValue.fromString('str');
            XmlUtils.setProtectedBinary(xml.documentElement, pv);
            expect(XmlUtils.serialize(xml)).to.be('<item Protected="True">text</item>');
            expect(xml.documentElement.protectedValue).to.be(pv);
        });

        it('sets node protected binary as ref', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedBinary(xml.documentElement, { ref: '123' });
            expect(XmlUtils.serialize(xml)).to.be('<item Ref="123">text</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });

        it('sets node protected binary as text', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedBinary(xml.documentElement, ByteUtils.base64ToBytes('YWJj'));
            expect(XmlUtils.serialize(xml)).to.be('<item>YWJj</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });

        it('sets node protected binary as base64 text', function() {
            var xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedBinary(xml.documentElement, 'YWJj');
            expect(XmlUtils.serialize(xml)).to.be('<item>YWJj</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });
    });

    describe('setProtectedValues', function() {
        it('sets protected values', function() {
            var xml = XmlUtils.parse('<root><item1><inner Protected="True">MTIz</inner><i2 Protected="True"></i2></item1>' +
            '<item2 Protected="True">NDU2</item2></root>');
            var count = 0;
            XmlUtils.setProtectedValues(xml.documentElement, {
                getSalt: function() { count++; return new Uint8Array([count, count, count]); }
            });
            var item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            var item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            var inner = XmlUtils.getChildNode(item1, 'inner');
            expect(item1.protectedValue).to.be(undefined);
            expect(item2.protectedValue).to.be.ok();
            expect(inner.protectedValue).to.be.ok();
            expect(inner.protectedValue.getText()).to.be('032');
            expect(item2.protectedValue.getText()).to.be('674');
        });

        it('generates error for bad protected values', function() {
            var xml = XmlUtils.parse('<root><inner Protected="True">MTIz</inner></root>');
            expect(function() {
                XmlUtils.setProtectedValues(xml.documentElement, { getSalt: function() { throw 1; } });
            }).to.throwException(function(e) {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Constants.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('Error FileCorrupt: bad protected value at line');
            });
        });
    });

    describe('updateProtectedValuesSalt', function() {
        it('sets protected values', function() {
            var xml = XmlUtils.parse('<root><item1><inner Protected="True">MTIz</inner><i2 Protected="True"></i2></item1>' +
            '<item2 Protected="True">NDU2</item2></root>');
            var item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            var item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            var inner = XmlUtils.getChildNode(item1, 'inner');
            inner.protectedValue = ProtectedValue.fromString('123');
            item2.protectedValue = ProtectedValue.fromString('456');
            var count = 0;
            XmlUtils.updateProtectedValuesSalt(xml.documentElement, {
                getSalt: function() { count++; return new Uint8Array([count, count, count]); }
            });
            expect(new Uint8Array(inner.protectedValue._salt)).to.be.eql([1,1,1]);
            expect(new Uint8Array(item2.protectedValue._salt)).to.be.eql([2,2,2]);
        });
    });

    describe('unprotectValues', function() {
        it('unprotects protected values', function() {
            var xml = XmlUtils.parse('<root><item1><inner Protected="True">MTIz</inner><i2 Protected="True"></i2></item1>' +
                '<item2 Protected="True">NDU2</item2></root>');
            var item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            var item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            var inner = XmlUtils.getChildNode(item1, 'inner');
            inner.protectedValue = ProtectedValue.fromString('123');
            item2.protectedValue = ProtectedValue.fromString('456');
            XmlUtils.unprotectValues(xml.documentElement);
            expect(XmlUtils.serialize(inner)).to.be('<inner ProtectInMemory="True">123</inner>');
            expect(XmlUtils.serialize(item2)).to.be('<item2 ProtectInMemory="True">456</item2>');
        });
    });

    describe('protectUnprotectedValues', function() {
        it('protects unprotected values', function() {
            var xml = XmlUtils.parse('<root><item1><inner ProtectInMemory="True">123</inner><i2 ProtectInMemory="True"></i2></item1>' +
                '<item2 ProtectInMemory="True">NDU2</item2></root>');
            var item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            var item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            var inner = XmlUtils.getChildNode(item1, 'inner');
            var salt = new ArrayBuffer(16);
            inner.protectedValue = ProtectedValue.fromString('123');
            item2.protectedValue = ProtectedValue.fromString('456');
            inner.protectedValue.setSalt(salt);
            item2.protectedValue.setSalt(salt);
            XmlUtils.protectUnprotectedValues(xml.documentElement);
            expect(XmlUtils.serialize(inner)).to.be('<inner Protected="True">MTIz</inner>');
            expect(XmlUtils.serialize(item2)).to.be('<item2 Protected="True">NDU2</item2>');
        });
    });

    describe('protectPlainValues', function() {
        it('protects plain values', function() {
            var xml = XmlUtils.parse('<root><item1><inner ProtectInMemory="True">123</inner><i2 ProtectInMemory="True"></i2></item1>' +
                '<item2 ProtectInMemory="True">456</item2></root>');
            XmlUtils.protectPlainValues(xml.documentElement);
            var item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            var item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            var inner = XmlUtils.getChildNode(item1, 'inner');

            expect(item1.protectedValue).to.be(undefined);
            expect(item2.protectedValue).to.be.ok();
            expect(inner.protectedValue).to.be.ok();
            expect(inner.protectedValue.getText()).to.be('123');
            expect(item2.protectedValue.getText()).to.be('456');
            expect(inner.textContent).to.be(inner.protectedValue.toString());
            expect(item2.textContent).to.be(item2.protectedValue.toString());
            expect(inner.getAttribute('Protected')).to.be.ok();
            expect(inner.getAttribute('ProtectInMemory')).not.be.ok();
        });
    });
});
