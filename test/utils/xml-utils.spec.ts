import expect from 'expect.js';
import {
    ByteUtils,
    Consts,
    KdbxError,
    KdbxUuid,
    ProtectedValue,
    ProtectSaltGenerator,
    Salsa20,
    XmlUtils
} from '../../lib';

describe('XmlUtils', () => {
    function removeSpaces(str: string) {
        return str.replace(/\s/g, '');
    }

    const isNode = !!global.process?.versions?.node;

    describe('parse', () => {
        it('parses XML document', () => {
            const xml = XmlUtils.parse('<root><item><cd>&lt;&gt;</cd></item></root>');
            expect(xml.documentElement.nodeName).to.be('root');
            expect(xml.documentElement.firstChild!.nodeName).to.be('item');
            expect(xml.documentElement.firstChild!.firstChild!.nodeName).to.be('cd');
            expect(xml.documentElement.firstChild!.firstChild!.textContent).to.be('<>');
        });

        if (isNode) {
            it('uses the global DOMParser if possible', () => {
                const doc = {
                    documentElement: 'hello',
                    getElementsByTagName: () => []
                };
                try {
                    // @ts-ignore
                    global.DOMParser = class {
                        parseFromString() {
                            return doc;
                        }
                    };
                    const xml = XmlUtils.parse('<root><item><cd>&lt;&gt;</cd></item></root>');
                    expect(xml).to.be(doc);
                } finally {
                    // @ts-ignore
                    delete global.DOMParser;
                }
            });
        }

        it('throws error for non-xml document', () => {
            expect(() => {
                XmlUtils.parse('err');
            }).to.throwException((e) => {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
        });

        it('throws error for malformed xml document', () => {
            expect(() => {
                XmlUtils.parse('<root><item><cd>&lt;&gt;</cd></item></bad>');
            }).to.throwException((e) => {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
        });

        it('throws error for generated parseerror element', () => {
            expect(() => {
                XmlUtils.parse('<root><parsererror/></root>');
            }).to.throwException((e) => {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('bad xml');
            });
        });

        it('parses bad characters', () => {
            let chars = '';
            for (let i = 0; i <= 0x20; i++) {
                chars += String.fromCharCode(i);
            }
            for (let j = 0x80; j <= 0xff; j++) {
                chars += String.fromCharCode(j);
            }
            const xml = XmlUtils.parse('<root><item><cd>' + chars + '</cd></item></root>');
            expect(xml.documentElement.nodeName).to.be('root');
            expect(xml.documentElement.firstChild!.nodeName).to.be('item');
        });
    });

    describe('serialize', () => {
        it('serializes XML document', () => {
            const doc = XmlUtils.parse('<root><item><cd>123</cd><e></e></item></root>');
            const xml = XmlUtils.serialize(doc);
            expect(xml).to.be('<root><item><cd>123</cd><e/></item></root>');
        });

        it('pretty prints XML document', () => {
            const doc = XmlUtils.parse('<root><item><cd>123</cd><e></e></item></root>');
            const xml = XmlUtils.serialize(doc, true);
            expect(xml).to.be(
                '<root>\n    <item>\n        <cd>123</cd>\n        <e/>\n    </item>\n</root>'
            );
        });

        if (isNode) {
            it('uses the global XMLSerializer if possible', () => {
                try {
                    // @ts-ignore
                    global.XMLSerializer = class {
                        serializeToString() {
                            return 'xml';
                        }
                    };
                    const doc = XmlUtils.parse('<root><item><cd>123</cd><e></e></item></root>');
                    const xml = XmlUtils.serialize(doc, true);
                    expect(xml).to.be('xml');
                } finally {
                    // @ts-ignore
                    delete global.XMLSerializer;
                }
            });
        }

        it('pretty prints processing instructions', () => {
            const doc = XmlUtils.parse(
                '<?xml version="1.0" encoding="UTF-8"?><root><item><cd>123</cd><e></e></item></root>'
            );
            const xml = XmlUtils.serialize(doc, true);
            expect(xml).to.be(
                '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n    <item>\n        <cd>123</cd>\n        <e/>\n    </item>\n</root>'
            );
        });
    });

    describe('create', () => {
        it('creates XML document', () => {
            const doc = XmlUtils.create('root');
            expect(doc.documentElement.nodeName).to.be('root');
        });
    });

    describe('getChildNode', () => {
        it('gets first child node', () => {
            const xml = XmlUtils.parse('<root><item>1</item><item>2</item></root>');
            const childNode = XmlUtils.getChildNode(xml.documentElement, 'item');
            expect(childNode).to.be.ok();
            expect(childNode!.textContent).to.be('1');
        });

        it("gets null if there's no matching child node", () => {
            const xml = XmlUtils.parse('<root><item>1</item><item>2</item></root>');
            const childNode = XmlUtils.getChildNode(xml.documentElement, 'notexisting');
            expect(childNode).to.be(null);
        });

        it('gets null for null', () => {
            const childNode = XmlUtils.getChildNode(null, 'notexisting');
            expect(childNode).to.be(null);
        });

        it("gets null if there's no child nodes at all", () => {
            const xml = XmlUtils.parse('<root><item/></root>');
            let childNode = XmlUtils.getChildNode(xml.documentElement, 'item');
            expect(childNode).to.be.ok();
            childNode = XmlUtils.getChildNode(childNode, 'notexisting');
            expect(childNode).to.be(null);
        });

        it("throws error if there's no matching node", () => {
            const xml = XmlUtils.parse('<root><item/></root>');
            expect(() => {
                XmlUtils.getChildNode(xml.documentElement, 'notexisting', 'not found');
            }).to.throwException((e) => {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('not found');
            });
        });
    });

    describe('addChildNode', () => {
        it('adds child node and returns it', () => {
            const xml = XmlUtils.parse('<root><old/></root>');
            const childNode = XmlUtils.addChildNode(xml.documentElement, 'item');
            XmlUtils.addChildNode(childNode, 'inner');
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be(
                '<root><old/><item><inner/></item></root>'
            );
        });
    });

    describe('getText', () => {
        it('returns node text', () => {
            const xml = XmlUtils.parse('<item> some text </item>');
            const text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be(' some text ');
        });

        it('returns empty string for existing node without content', () => {
            const xml = XmlUtils.parse('<item></item>');
            const text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('');
        });

        it('returns empty string for empty node', () => {
            const xml = XmlUtils.parse('<item/>');
            const text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('');
        });

        it('returns undefined for not existing node node', () => {
            const text = XmlUtils.getText(null);
            expect(text).to.be(undefined);
        });

        it('returns node protected value if any', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            xml.documentElement.protectedValue = ProtectedValue.fromString('pr');
            const text = XmlUtils.getText(xml.documentElement);
            expect(text).to.be('pr');
        });
    });

    describe('setText', () => {
        it('sets node text', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setText(xml.documentElement, 'new');
            expect(XmlUtils.serialize(xml)).to.be('<item>new</item>');
        });

        it('sets node empty text', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setText(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });

        it('escapes special characters', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setText(xml.documentElement, ']]>');
            expect(XmlUtils.serialize(xml)).to.be('<item>]]&gt;</item>');
        });
    });

    describe('getBytes', () => {
        it('returns node bytes', () => {
            const xml = XmlUtils.parse('<item>YWJj</item>');
            const bytes = new Uint8Array(XmlUtils.getBytes(xml.documentElement)!);
            expect(bytes).to.be.eql(
                new Uint8Array(['a'.charCodeAt(0), 'b'.charCodeAt(0), 'c'.charCodeAt(0)])
            );
        });

        it('returns undefined for empty node', () => {
            const xml = XmlUtils.parse('<item></item>');
            const bytes = XmlUtils.getBytes(xml.documentElement);
            expect(bytes).to.be(undefined);
        });
    });

    describe('setBytes', () => {
        it('sets node bytes from array', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBytes(xml.documentElement, new Uint8Array([1, 2, 3]));
            expect(XmlUtils.serialize(xml)).to.be('<item>AQID</item>');
        });

        it('sets node bytes from base64 string', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBytes(xml.documentElement, 'AQID');
            expect(XmlUtils.serialize(xml)).to.be('<item>AQID</item>');
        });

        it('sets node empty bytes', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBytes(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setBytes(xml.documentElement, '');
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setBytes(xml.documentElement, new Uint8Array(0));
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('setDate', () => {
        it('sets node date in ISO format', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setDate(xml.documentElement, new Date('2015-08-17T21:20Z'));
            expect(XmlUtils.serialize(xml)).to.be('<item>2015-08-17T21:20:00Z</item>');
        });

        it('sets node date in binary format', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setDate(xml.documentElement, new Date('2015-08-16T14:45:23.000Z'), true);
            expect(XmlUtils.serialize(xml)).to.be('<item>A5lizQ4AAAA=</item>');
        });

        it('sets node empty date', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setDate(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getDate', () => {
        it('returns node date', () => {
            const xml = XmlUtils.parse('<item>2015-01-02T03:04:05Z</item>');
            const dt = XmlUtils.getDate(xml.documentElement);
            expect(dt!.getUTCFullYear()).to.be(2015);
            expect(dt!.getUTCMonth()).to.be(0);
            expect(dt!.getUTCDate()).to.be(2);
            expect(dt!.getUTCHours()).to.be(3);
            expect(dt!.getUTCMinutes()).to.be(4);
            expect(dt!.getUTCSeconds()).to.be(5);
        });

        it('returns node date from base64', () => {
            const xml = XmlUtils.parse('<item>A5lizQ4AAAA=</item>');
            const dt = XmlUtils.getDate(xml.documentElement);
            expect(dt!.toISOString()).to.be('2015-08-16T14:45:23.000Z');
        });

        it('returns undefined for empty node', () => {
            const xml = XmlUtils.parse('<item></item>');
            const dt = XmlUtils.getDate(xml.documentElement);
            expect(dt).to.be(undefined);
        });
    });

    describe('getNumber', () => {
        it('returns node number', () => {
            const xml = XmlUtils.parse('<item>123</item>');
            const num = XmlUtils.getNumber(xml.documentElement);
            expect(num).to.be(123);
        });

        it('returns undefined for empty node', () => {
            const xml = XmlUtils.parse('<item></item>');
            const num = XmlUtils.getNumber(xml.documentElement);
            expect(num).to.be(undefined);
        });
    });

    describe('setNumber', () => {
        it('sets node number', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setNumber(xml.documentElement, 1);
            expect(XmlUtils.serialize(xml)).to.be('<item>1</item>');
        });

        it('sets zero as node number', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setNumber(xml.documentElement, 0);
            expect(XmlUtils.serialize(xml)).to.be('<item>0</item>');
        });

        it('sets node empty number', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setNumber(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
            XmlUtils.setNumber(xml.documentElement, NaN);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getBoolean', () => {
        it('returns node true', () => {
            let xml = XmlUtils.parse('<item>True</item>');
            let bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(true);
            xml = XmlUtils.parse('<item>true</item>');
            bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(true);
        });

        it('returns node false', () => {
            let xml = XmlUtils.parse('<item>False</item>');
            let bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(false);
            xml = XmlUtils.parse('<item>false</item>');
            bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(false);
        });

        it('returns undefined for unknown text', () => {
            const xml = XmlUtils.parse('<item>blablabla</item>');
            const bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(undefined);
        });

        it('returns null for null', () => {
            const xml = XmlUtils.parse('<item>null</item>');
            const bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(null);
        });

        it('returns undefined for empty node', () => {
            const xml = XmlUtils.parse('<item></item>');
            const bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(undefined);
        });

        it('returns undefined for closed node', () => {
            const xml = XmlUtils.parse('<item />');
            const bool = XmlUtils.getBoolean(xml.documentElement);
            expect(bool).to.be(undefined);
        });
    });

    describe('strToBoolean', () => {
        it('converts "true" to boolean', () => {
            expect(XmlUtils.strToBoolean('true')).to.be(true);
        });

        it('converts "false" to boolean', () => {
            expect(XmlUtils.strToBoolean('false')).to.be(false);
        });

        it('converts "null" to boolean', () => {
            expect(XmlUtils.strToBoolean('null')).to.be(null);
        });

        it('converts a bad string to null', () => {
            expect(XmlUtils.strToBoolean('bad')).to.be(undefined);
        });

        it('converts an empty string to undefined', () => {
            expect(XmlUtils.strToBoolean('')).to.be(undefined);
        });

        it('converts null to undefined', () => {
            expect(XmlUtils.strToBoolean(null)).to.be(undefined);
        });

        it('converts undefined to undefined', () => {
            expect(XmlUtils.strToBoolean(undefined)).to.be(undefined);
        });
    });

    describe('setBoolean', () => {
        it('sets node false', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, false);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item>False</item>');
        });

        it('sets node true', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, true);
            expect(XmlUtils.serialize(xml)).to.be('<item>True</item>');
        });

        it('sets node null', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, null);
            expect(XmlUtils.serialize(xml)).to.be('<item>null</item>');
        });

        it('sets node empty boolean', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setBoolean(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getUuid', () => {
        it('returns node uuid', () => {
            const xml = XmlUtils.parse('<item>hADuI/JGbkmnRZxNNIZDew==</item>');
            const uuid = XmlUtils.getUuid(xml.documentElement);
            expect(uuid).to.be.ok();
            expect(uuid?.id).to.be('hADuI/JGbkmnRZxNNIZDew==');
        });

        it('returns undefined for empty node', () => {
            const xml = XmlUtils.parse('<item></item>');
            const uuid = XmlUtils.getUuid(xml.documentElement);
            expect(uuid).to.be(undefined);
        });
    });

    describe('setUuid', () => {
        it('sets node uuid', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setUuid(xml.documentElement, new KdbxUuid(new ArrayBuffer(16)));
            expect(XmlUtils.serialize(xml)).to.be('<item>AAAAAAAAAAAAAAAAAAAAAA==</item>');
        });

        it('sets node empty uuid', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setUuid(xml.documentElement, undefined);
            expect(removeSpaces(XmlUtils.serialize(xml))).to.be('<item/>');
        });
    });

    describe('getProtectedText', () => {
        it('returns node protected text', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            const pv = ProtectedValue.fromString('pv');
            xml.documentElement.protectedValue = pv;
            const res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be(pv);
        });

        it('returns node text as protected text', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            const res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be('text');
        });

        it('returns empty string as protected text for node without text', () => {
            const xml = XmlUtils.parse('<item></item>');
            const res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be('');
        });

        it('returns empty string as protected text for empty node', () => {
            const xml = XmlUtils.parse('<item></item>');
            const res = XmlUtils.getProtectedText(xml.documentElement);
            expect(res).to.be('');
        });
    });

    describe('setProtectedText', () => {
        it('sets node protected text as protected value', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            const pv = ProtectedValue.fromString('str');
            XmlUtils.setProtectedText(xml.documentElement, pv);
            expect(XmlUtils.serialize(xml)).to.be('<item Protected="True">text</item>');
            expect(xml.documentElement.protectedValue).to.be(pv);
        });

        it('sets node protected text as text', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedText(xml.documentElement, 'str');
            expect(XmlUtils.serialize(xml)).to.be('<item>str</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });
    });

    describe('getProtectedBinary', () => {
        it('returns node protected binary', () => {
            const xml = XmlUtils.parse('<item>YWJj</item>');
            const pv = ProtectedValue.fromString('pv');
            xml.documentElement.protectedValue = pv;
            const res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(res).to.be(pv);
        });

        it('returns node ref as protected binary', () => {
            const xml = XmlUtils.parse('<item Ref="MyRef">YWJj</item>');
            const res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(res).to.be.eql({ ref: 'MyRef' });
        });

        it('returns undefined as protected binary', () => {
            const xml = XmlUtils.parse('<item></item>');
            const res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(res).to.be(undefined);
        });

        it('returns node text as protected binary', () => {
            const xml = XmlUtils.parse('<item>YWJj</item>');
            const res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(ByteUtils.bytesToString(res as ArrayBuffer)).to.be('abc');
        });

        it('decompresses node text as protected binary', () => {
            const xml = XmlUtils.parse(
                '<item Compressed="True">H4sIAAAAAAAAA0tMSgYAwkEkNQMAAAA=</item>'
            );
            const res = XmlUtils.getProtectedBinary(xml.documentElement);
            expect(ByteUtils.bytesToString(res as ArrayBuffer)).to.be('abc');
        });
    });

    describe('setProtectedBinary', () => {
        it('sets node protected binary as protected value', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            const pv = ProtectedValue.fromString('str');
            XmlUtils.setProtectedBinary(xml.documentElement, pv);
            expect(XmlUtils.serialize(xml)).to.be('<item Protected="True">text</item>');
            expect(xml.documentElement.protectedValue).to.be(pv);
        });

        it('sets node protected binary as ref', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedBinary(xml.documentElement, { ref: '123' });
            expect(XmlUtils.serialize(xml)).to.be('<item Ref="123">text</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });

        it('sets node protected binary as text', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedBinary(xml.documentElement, ByteUtils.base64ToBytes('YWJj'));
            expect(XmlUtils.serialize(xml)).to.be('<item>YWJj</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });

        it('sets node protected binary as encoded text', () => {
            const xml = XmlUtils.parse('<item>text</item>');
            XmlUtils.setProtectedBinary(xml.documentElement, new TextEncoder().encode('abc'));
            expect(XmlUtils.serialize(xml)).to.be('<item>YWJj</item>');
            expect(xml.documentElement.protectedValue).to.be(undefined);
        });
    });

    describe('setProtectedValues', () => {
        it('sets protected values', () => {
            const xml = XmlUtils.parse(
                '<root><item1><inner Protected="True">MTIz</inner><i2 Protected="True"></i2></item1>' +
                    '<item2 Protected="True">NDU2</item2></root>'
            );
            let count = 0;

            class TestPSG extends ProtectSaltGenerator {
                constructor() {
                    super(new Salsa20(new Uint8Array(32), new Uint8Array(32)));
                }

                getSalt(): ArrayBuffer {
                    count++;
                    return new Uint8Array([count, count, count]);
                }
            }

            XmlUtils.setProtectedValues(xml.documentElement, new TestPSG());
            const item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            const item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            const inner = XmlUtils.getChildNode(item1, 'inner');
            expect(item1!.protectedValue).to.be(undefined);
            expect(item2!.protectedValue).to.be.ok();
            expect(inner!.protectedValue).to.be.ok();
            expect(inner!.protectedValue!.getText()).to.be('032');
            expect(item2!.protectedValue!.getText()).to.be('674');
        });

        it('generates error for bad protected values', () => {
            const xml = XmlUtils.parse('<root><inner Protected="True">MTIz</inner></root>');

            class TestPSGThrows extends ProtectSaltGenerator {
                constructor() {
                    super(new Salsa20(new Uint8Array(32), new Uint8Array(32)));
                }

                getSalt(): ArrayBuffer {
                    throw new Error('boom');
                }
            }

            expect(() => {
                XmlUtils.setProtectedValues(xml.documentElement, new TestPSGThrows());
            }).to.throwException((e) => {
                expect(e).to.be.a(KdbxError);
                expect(e.code).to.be(Consts.ErrorCodes.FileCorrupt);
                expect(e.message).to.contain('Error FileCorrupt: bad protected value at line');
            });
        });
    });

    describe('updateProtectedValuesSalt', () => {
        it('sets protected values', () => {
            const xml = XmlUtils.parse(
                '<root><item1><inner Protected="True">MTIz</inner><i2 Protected="True"></i2></item1>' +
                    '<item2 Protected="True">NDU2</item2></root>'
            );
            const item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            const item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            const inner = XmlUtils.getChildNode(item1, 'inner');
            inner!.protectedValue = ProtectedValue.fromString('123');
            item2!.protectedValue = ProtectedValue.fromString('456');
            let count = 0;

            class TestPSG extends ProtectSaltGenerator {
                constructor() {
                    super(new Salsa20(new Uint8Array(32), new Uint8Array(32)));
                }

                getSalt(): ArrayBuffer {
                    count++;
                    return new Uint8Array([count, count, count]);
                }
            }

            XmlUtils.updateProtectedValuesSalt(xml.documentElement, new TestPSG());
            // @ts-ignore
            expect(new Uint8Array(inner!.protectedValue._salt)).to.be.eql([1, 1, 1]);
            // @ts-ignore
            expect(new Uint8Array(item2!.protectedValue._salt)).to.be.eql([2, 2, 2]);
        });
    });

    describe('unprotectValues', () => {
        it('unprotects protected values', () => {
            const xml = XmlUtils.parse(
                '<root><item1><inner Protected="True">MTIz</inner><i2 Protected="True"></i2></item1>' +
                    '<item2 Protected="True">NDU2</item2></root>'
            );
            const item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            const item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            const inner = XmlUtils.getChildNode(item1, 'inner');
            inner!.protectedValue = ProtectedValue.fromString('123');
            item2!.protectedValue = ProtectedValue.fromString('456');
            XmlUtils.unprotectValues(xml.documentElement);
            expect(XmlUtils.serialize(inner as Document)).to.be(
                '<inner ProtectInMemory="True">123</inner>'
            );
            expect(XmlUtils.serialize(item2 as Document)).to.be(
                '<item2 ProtectInMemory="True">456</item2>'
            );
        });
    });

    describe('protectUnprotectedValues', () => {
        it('protects unprotected values', () => {
            const xml = XmlUtils.parse(
                '<root><item1><inner ProtectInMemory="True">123</inner><i2 ProtectInMemory="True"></i2></item1>' +
                    '<item2 ProtectInMemory="True">NDU2</item2></root>'
            );
            const item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            const item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            const inner = XmlUtils.getChildNode(item1, 'inner');
            const salt = new ArrayBuffer(16);
            inner!.protectedValue = ProtectedValue.fromString('123');
            item2!.protectedValue = ProtectedValue.fromString('456');
            inner!.protectedValue.setSalt(salt);
            item2!.protectedValue.setSalt(salt);
            XmlUtils.protectUnprotectedValues(xml.documentElement);
            expect(XmlUtils.serialize(inner as Document)).to.be(
                '<inner Protected="True">MTIz</inner>'
            );
            expect(XmlUtils.serialize(item2 as Document)).to.be(
                '<item2 Protected="True">NDU2</item2>'
            );
        });
    });

    describe('protectPlainValues', () => {
        it('protects plain values', () => {
            const xml = XmlUtils.parse(
                '<root><item1><inner ProtectInMemory="True">123</inner><i2 ProtectInMemory="True"></i2></item1>' +
                    '<item2 ProtectInMemory="True">456</item2></root>'
            );
            XmlUtils.protectPlainValues(xml.documentElement);
            const item1 = XmlUtils.getChildNode(xml.documentElement, 'item1');
            const item2 = XmlUtils.getChildNode(xml.documentElement, 'item2');
            const inner = XmlUtils.getChildNode(item1, 'inner');

            expect(item1!.protectedValue).to.be(undefined);
            expect(item2!.protectedValue).to.be.ok();
            expect(inner!.protectedValue).to.be.ok();
            expect(inner!.protectedValue!.getText()).to.be('123');
            expect(item2!.protectedValue!.getText()).to.be('456');
            expect(inner!.textContent).to.be(inner!.protectedValue!.toString());
            expect(item2!.textContent).to.be(item2!.protectedValue!.toString());
            expect((inner as Element).getAttribute('Protected')).to.be.ok();
            expect((inner as Element).getAttribute('ProtectInMemory')).not.be.ok();
        });
    });
});
