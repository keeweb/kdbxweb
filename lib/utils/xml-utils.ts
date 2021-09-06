import { gunzipSync } from 'fflate';
import { KdbxError } from '../errors/kdbx-error';
import { ErrorCodes } from '../defs/consts';
import * as XmlNames from '../defs/xml-names';
import { arrayToBuffer, base64ToBytes, bytesToBase64 } from './byte-utils';
import { Int64 } from './int64';
import { KdbxUuid } from '../format/kdbx-uuid';
import { ProtectedValue } from '../crypto/protected-value';
import { ProtectSaltGenerator } from '../crypto/protect-salt-generator';
import { KdbxBinaries, KdbxBinaryOrRef } from '../format/kdbx-binaries';

const DateRegex = /\.\d\d\d/;
const EpochSeconds = 62135596800;
const TagsSplitRegex = /\s*[;,:]\s*/;

declare global {
    interface Node {
        protectedValue: ProtectedValue | undefined;
        lineNumber: number | undefined;
    }
}

function createDOMParser() {
    if (global.DOMParser) {
        return new global.DOMParser();
    }

    const parserArg = {
        errorHandler: {
            warning: (e: Error) => {
                throw e;
            },
            error: (e: Error) => {
                throw e;
            },
            fatalError: (e: Error) => {
                throw e;
            }
        }
    };

    /* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call */
    const { DOMParser } = require('@xmldom/xmldom');
    return <typeof global.DOMParser>new DOMParser(parserArg);
    /* eslint-enable */
}

function createXMLSerializer() {
    if (global.XMLSerializer) {
        return new global.XMLSerializer();
    }

    /* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call */
    const { XMLSerializer } = require('@xmldom/xmldom');
    return <typeof global.XMLSerializer>new XMLSerializer();
    /* eslint-enable */
}

export function parse(xml: string): Document {
    const parser = createDOMParser();

    let doc;
    // eslint-disable-next-line no-control-regex
    xml = xml.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, '');
    try {
        doc = parser.parseFromString(xml, 'application/xml');
    } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        throw new KdbxError(ErrorCodes.FileCorrupt, `bad xml: ${errMsg}`);
    }
    if (!doc.documentElement) {
        throw new KdbxError(ErrorCodes.FileCorrupt, 'bad xml');
    }
    const parserError = doc.getElementsByTagName('parsererror')[0];
    if (parserError) {
        throw new KdbxError(ErrorCodes.FileCorrupt, `bad xml: ${parserError.textContent}`);
    }
    return doc;
}

export function serialize(doc: Document, prettyPrint = false): string {
    if (prettyPrint) {
        prettyPrintXmlNode(doc, 0);
    }
    let xml = createXMLSerializer().serializeToString(doc);
    if (prettyPrint && xml.startsWith('<?')) {
        xml = xml.replace(/^(<\?.*?\?>)</, '$1\n<');
    }
    return xml;
}

function prettyPrintXmlNode(node: Node, indentationLevel: number): void {
    const numChildNodes = node.childNodes.length;

    if (numChildNodes === 0) {
        return;
    }

    const formatStr = '\n' + '    '.repeat(indentationLevel);
    const prevFormatStr = indentationLevel > 0 ? '\n' + '    '.repeat(indentationLevel - 1) : '';
    const doc = node.ownerDocument || <Document>node;

    const childNodes = [];
    let childNode;

    for (let i = 0; i < numChildNodes; i++) {
        childNode = node.childNodes[i];
        if (
            childNode.nodeType !== doc.TEXT_NODE &&
            childNode.nodeType !== doc.PROCESSING_INSTRUCTION_NODE
        ) {
            childNodes.push(childNode);
        }
    }

    for (let j = 0; j < childNodes.length; j++) {
        childNode = childNodes[j];

        const isFirstDocumentNode = indentationLevel === 0 && j === 0;
        if (!isFirstDocumentNode) {
            const textNodeBefore = doc.createTextNode(formatStr);
            node.insertBefore(textNodeBefore, childNode);
        }

        if (!childNode.nextSibling && indentationLevel > 0) {
            const textNodeAfter = doc.createTextNode(prevFormatStr);
            node.appendChild(textNodeAfter);
        }

        prettyPrintXmlNode(childNode, indentationLevel + 1);
    }
}

export function create(rootNode: string): Document {
    return parse('<?xml version="1.0" encoding="utf-8" standalone="yes"?><' + rootNode + '/>');
}

export function getChildNode(node: Node | null, tagName: string): Node | null;
export function getChildNode(node: Node | null, tagName: string, errorMsgIfAbsent: string): Node;
export function getChildNode(
    node: Node | null,
    tagName: string,
    errorMsgIfAbsent?: string
): Node | null {
    if (node && node.childNodes) {
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            if ((<Element>cn[i]).tagName === tagName) {
                return cn[i];
            }
        }
    }
    if (errorMsgIfAbsent) {
        throw new KdbxError(ErrorCodes.FileCorrupt, errorMsgIfAbsent);
    } else {
        return null;
    }
}

export function addChildNode(node: Node, tagName: string): Element {
    return node.appendChild((node.ownerDocument || <Document>node).createElement(tagName));
}

export function getText(node: Node | null): string | undefined {
    if (!node?.childNodes) {
        return undefined;
    }
    return node.protectedValue ? node.protectedValue.getText() : node.textContent ?? undefined;
}

export function setText(node: Node, text: string | undefined): void {
    node.textContent = text || '';
}

export function getTags(node: Node): string[] {
    const text = getText(node);
    if (!text) {
        return [];
    }
    return text
        .split(TagsSplitRegex)
        .map((t) => t.trim())
        .filter((s) => s);
}

export function setTags(node: Node, tags: string[]): void {
    setText(node, tags.join(', '));
}

export function getBytes(node: Node): ArrayBuffer | undefined {
    const text = getText(node);
    return text ? arrayToBuffer(base64ToBytes(text)) : undefined;
}

export function setBytes(node: Node, bytes: ArrayBuffer | Uint8Array | string | undefined): void {
    if (typeof bytes === 'string') {
        bytes = base64ToBytes(bytes);
    }
    setText(node, bytes ? bytesToBase64(arrayToBuffer(bytes)) : undefined);
}

export function getDate(node: Node): Date | undefined {
    const text = getText(node);
    if (!text) {
        return undefined;
    }
    if (text.indexOf(':') > 0) {
        return new Date(text);
    }
    const bytes = new DataView(arrayToBuffer(base64ToBytes(text)));
    const secondsFrom00 = new Int64(bytes.getUint32(0, true), bytes.getUint32(4, true)).value;
    const diff = (secondsFrom00 - EpochSeconds) * 1000;
    return new Date(diff);
}

export function setDate(node: Node, date: Date | undefined, binary = false): void {
    if (date) {
        if (binary) {
            const secondsFrom00 = Math.floor(date.getTime() / 1000) + EpochSeconds;
            const bytes = new DataView(new ArrayBuffer(8));
            const val64 = Int64.from(secondsFrom00);
            bytes.setUint32(0, val64.lo, true);
            bytes.setUint32(4, val64.hi, true);
            setText(node, bytesToBase64(bytes.buffer));
        } else {
            setText(node, date.toISOString().replace(DateRegex, ''));
        }
    } else {
        setText(node, '');
    }
}

export function getNumber(node: Node): number | undefined {
    const text = getText(node);
    return text ? +text : undefined;
}

export function setNumber(node: Node, number: number | undefined): void {
    setText(node, typeof number === 'number' && !isNaN(number) ? number.toString() : undefined);
}

export function getBoolean(node: Node): boolean | null | undefined {
    const text = getText(node);
    return text ? strToBoolean(text) : undefined;
}

export function setBoolean(node: Node, boolean: boolean | null | undefined): void {
    setText(
        node,
        boolean === undefined ? '' : boolean === null ? 'null' : boolean ? 'True' : 'False'
    );
}

export function strToBoolean(str: string | null | undefined): boolean | null | undefined {
    switch (str?.toLowerCase()) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
    }
    return undefined;
}

export function getUuid(node: Node): KdbxUuid | undefined {
    const bytes = getBytes(node);
    return bytes ? new KdbxUuid(bytes) : undefined;
}

export function setUuid(
    node: Node,
    uuid: KdbxUuid | ArrayBuffer | Uint8Array | string | undefined
): void {
    const uuidBytes = uuid instanceof KdbxUuid ? uuid.toBytes() : uuid;
    setBytes(node, uuidBytes);
}

export function getProtectedText(node: Node): ProtectedValue | string | undefined {
    return (node.protectedValue || node.textContent) ?? undefined;
}

export function setProtectedText(node: Node, text: ProtectedValue | string): void {
    if (text instanceof ProtectedValue) {
        node.protectedValue = text;
        (<Element>node).setAttribute(XmlNames.Attr.Protected, 'True');
    } else {
        setText(node, text);
    }
}

export function getProtectedBinary(node: Node): KdbxBinaryOrRef | undefined {
    if (node.protectedValue) {
        return node.protectedValue;
    }
    const text = node.textContent;
    const ref = (<Element>node).getAttribute(XmlNames.Attr.Ref);
    if (ref) {
        return { ref };
    }
    if (!text) {
        return undefined;
    }
    const compressed = strToBoolean((<Element>node).getAttribute(XmlNames.Attr.Compressed));
    let bytes = base64ToBytes(text);
    if (compressed) {
        bytes = gunzipSync(bytes);
    }
    return arrayToBuffer(bytes);
}

export function setProtectedBinary(node: Node, binary: KdbxBinaryOrRef): void {
    if (binary instanceof ProtectedValue) {
        node.protectedValue = binary;
        (<Element>node).setAttribute(XmlNames.Attr.Protected, 'True');
    } else if (KdbxBinaries.isKdbxBinaryRef(binary)) {
        (<Element>node).setAttribute(XmlNames.Attr.Ref, binary.ref);
    } else {
        setBytes(node, binary);
    }
}

export function traverse(node: Node, callback: (node: Element) => void): void {
    callback(<Element>node);
    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        const childNode = <Element>cn[i];
        if (childNode.tagName) {
            traverse(childNode, callback);
        }
    }
}

export function setProtectedValues(node: Node, protectSaltGenerator: ProtectSaltGenerator): void {
    traverse(node, (node) => {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.Protected))) {
            try {
                const value = arrayToBuffer(base64ToBytes(node.textContent || ''));
                if (value.byteLength) {
                    const salt = protectSaltGenerator.getSalt(value.byteLength);
                    node.protectedValue = new ProtectedValue(value, salt);
                }
            } catch (e) {
                throw new KdbxError(
                    ErrorCodes.FileCorrupt,
                    `bad protected value at line ${node.lineNumber}: ${e}`
                );
            }
        }
    });
}

export function updateProtectedValuesSalt(
    node: Node,
    protectSaltGenerator: ProtectSaltGenerator
): void {
    traverse(node, (node) => {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.Protected)) && node.protectedValue) {
            const newSalt = protectSaltGenerator.getSalt(node.protectedValue.byteLength);
            node.protectedValue.setSalt(newSalt);
            node.textContent = node.protectedValue.toString();
        }
    });
}

export function unprotectValues(node: Node): void {
    traverse(node, (node) => {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.Protected)) && node.protectedValue) {
            node.removeAttribute(XmlNames.Attr.Protected);
            node.setAttribute(XmlNames.Attr.ProtectedInMemPlainXml, 'True');
            node.textContent = node.protectedValue.getText();
        }
    });
}

export function protectUnprotectedValues(node: Node): void {
    traverse(node, (node) => {
        if (
            strToBoolean(node.getAttribute(XmlNames.Attr.ProtectedInMemPlainXml)) &&
            node.protectedValue
        ) {
            node.removeAttribute(XmlNames.Attr.ProtectedInMemPlainXml);
            node.setAttribute(XmlNames.Attr.Protected, 'True');
            node.textContent = node.protectedValue.toString();
        }
    });
}

export function protectPlainValues(node: Node): void {
    traverse(node, (node) => {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.ProtectedInMemPlainXml))) {
            node.protectedValue = ProtectedValue.fromString(node.textContent || '');
            node.textContent = node.protectedValue.toString();
            node.removeAttribute(XmlNames.Attr.ProtectedInMemPlainXml);
            node.setAttribute(XmlNames.Attr.Protected, 'True');
        }
    });
}
