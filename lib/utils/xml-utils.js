'use strict';

var KdbxError = require('./../errors/kdbx-error'),
    Consts = require('./../defs/consts'),
    XmlNames = require('../defs/xml-names'),
    KdbxUuid = require('./../format/kdbx-uuid'),
    ProtectedValue = require('./../crypto/protected-value'),
    ByteUtils = require('./byte-utils'),
    Int64 = require('./int64'),
    pako = require('pako');

var dateRegex = /\.\d\d\d/;

var dom = global.DOMParser ? global : require('xmldom');
var domParserArg = global.DOMParser ? undefined : {
    errorHandler: {
        error: function(e) { throw e; },
        fatalError: function(e) { throw e; }
    }
};

var EpochSeconds = 62135596800;

/**
 * Parses XML document
 * Throws an error in case of invalid XML
 * @param {string} xml - xml document
 * @returns {Document}
 */
function parse(xml) {
    var parser = domParserArg ? new dom.DOMParser(domParserArg) : new dom.DOMParser();
    var doc;
    try {
        doc = parser.parseFromString(xml, 'application/xml');
    } catch (e) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad xml: ' + e.message);
    }
    if (!doc.documentElement) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad xml');
    }
    var parserError = doc.getElementsByTagName('parsererror')[0];
    if (parserError) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad xml: ' + parserError.textContent);
    }
    return doc;
}

/**
 * Serializes document to XML string
 * @param {Document} doc - source document
 * @returns {string} - xml content
 */
function serialize(doc) {
    return new dom.XMLSerializer().serializeToString(doc);
}

/**
 * Creates a document with specified root node name
 * @param {string} rootNode - root node name
 * @returns {Document} - created XML document
 */
function create(rootNode) {
    return parse('<?xml version="1.0" encoding="utf-8" standalone="yes"?><' + rootNode + '/>');
}

/**
 * Gets first child node from xml
 * @param {Node} node - parent node for search
 * @param {string} tagName - child node tag name
 * @param {string} [errorMsgIfAbsent] - if set, error will be thrown if node is absent
 * @returns {Node} - first found node, or null, if there's no such node
 */
function getChildNode(node, tagName, errorMsgIfAbsent) {
    if (node && node.childNodes) {
        for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            if (cn[i].tagName === tagName) {
                return cn[i];
            }
        }
    }
    if (errorMsgIfAbsent) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, errorMsgIfAbsent);
    } else {
        return null;
    }
}

/**
 * Adds child node to xml
 * @param {Node} node - parent node
 * @param {string} tagName - child node tag name
 * @returns {Node} - created node
 */
function addChildNode(node, tagName) {
    return node.appendChild((node.ownerDocument || node).createElement(tagName));
}

/**
 * Gets node inner text
 * @param {Node} node - xml node
 * @return {string|undefined} - node inner text or undefined, if the node is empty
 */
function getText(node) {
    if (!node || !node.childNodes) {
        return undefined;
    }
    return node.protectedValue ? node.protectedValue.text : node.textContent;
}

/**
 * Sets node inner text
 * @param {Node} node
 * @param {string} text
 */
function setText(node, text) {
    node.textContent = text || '';
}

/**
 * Parses bytes saved by KeePass from XML
 * @param {Node} node - xml node with bytes saved by KeePass (base64 format)
 * @return {ArrayBuffer} - ArrayBuffer or undefined, if the tag is empty
 */
function getBytes(node) {
    var text = getText(node);
    return text ? ByteUtils.arrayToBuffer(ByteUtils.base64ToBytes(text)) : undefined;
}

/**
 * Sets bytes for node
 * @param {Node} node
 * @param {ArrayBuffer|Uint8Array|string|undefined} bytes
 */
function setBytes(node, bytes) {
    if (typeof bytes === 'string') {
        bytes = ByteUtils.base64ToBytes(bytes);
    }
    setText(node, bytes ? ByteUtils.bytesToBase64(ByteUtils.arrayToBuffer(bytes)) : undefined);
}

/**
 * Parses date saved by KeePass from XML
 * @param {Node} node - xml node with date saved by KeePass (ISO format or base64-uint64) format
 * @return {Date} - date or undefined, if the tag is empty
 */
function getDate(node) {
    var text = getText(node);
    if (!text) {
        return undefined;
    }
    if (text.indexOf(':') > 0) {
        return new Date(text);
    }
    var bytes = new DataView(ByteUtils.arrayToBuffer(ByteUtils.base64ToBytes(text)));
    var secondsFrom00 = new Int64(bytes.getUint32(0, true), bytes.getUint32(4, true)).value;
    var diff = (secondsFrom00 - EpochSeconds) * 1000;
    return new Date(diff);
}

/**
 * Sets node date as string or binary
 * @param {Node} node
 * @param {Date|undefined} date
 * @param {boolean} [binary=false]
 */
function setDate(node, date, binary) {
    if (date) {
        if (binary) {
            var secondsFrom00 = Math.floor(date.getTime() / 1000) + EpochSeconds;
            var bytes = new DataView(new ArrayBuffer(8));
            var val64 = Int64.from(secondsFrom00);
            bytes.setUint32(0, val64.lo, true);
            bytes.setUint32(4, val64.hi, true);
            setText(node, ByteUtils.bytesToBase64(bytes.buffer));
        } else {
            setText(node, date.toISOString().replace(dateRegex, ''));
        }
    } else {
        setText(node, '');
    }
}

/**
 * Parses number saved by KeePass from XML
 * @param {Node} node - xml node with number saved by KeePass
 * @return {Number|undefined} - number or undefined, if the tag is empty
 */
function getNumber(node) {
    var text = getText(node);
    return text ? +text : undefined;
}

/**
 * Sets node number
 * @param {Node} node
 * @return {Number|undefined} number
 */
function setNumber(node, number) {
    setText(node, typeof number === 'number' && !isNaN(number) ? number.toString() : undefined);
}

/**
 * Parses boolean saved by KeePass from XML
 * @param {Node} node - xml node with boolean saved by KeePass
 * @return {boolean|undefined} - boolean or undefined, if the tag is empty
 */
function getBoolean(node) {
    var text = getText(node);
    return text ? strToBoolean(text) : undefined;
}

/**
 * Sets node boolean
 * @param {Node} node
 * @param {boolean|undefined} boolean
 */
function setBoolean(node, boolean) {
    setText(node, boolean === undefined ? '' : boolean === null ? 'null' : boolean ? 'True' : 'False');
}

/**
 * Converts saved string to boolean
 * @param {string} str
 * @returns {boolean}
 */
function strToBoolean(str) {
    switch (str && str.toLowerCase && str.toLowerCase()) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'null':
            return null;
    }
    return undefined;
}

/**
 * Parses Uuid saved by KeePass from XML
 * @param {Node} node - xml node with Uuid saved by KeePass
 * @return {KdbxUuid} - Uuid or undefined, if the tag is empty
 */
function getUuid(node) {
    var bytes = getBytes(node);
    return bytes ? new KdbxUuid(bytes) : undefined;
}

/**
 * Sets node uuid
 * @param {Node} node
 * @param {KdbxUuid} uuid
 */
function setUuid(node, uuid) {
    var uuidBytes = uuid instanceof KdbxUuid ? uuid.toBytes() : uuid;
    setBytes(node, uuidBytes);
}

/**
 * Gets node protected text from inner text
 * @param {Node} node
 * @return {ProtectedValue|string}
 */
function getProtectedText(node) {
    return node.protectedValue || node.textContent;
}

/**
 * Sets node protected text
 * @param {Node} node
 * @param {ProtectedValue|string} text
 */
function setProtectedText(node, text) {
    if (text instanceof ProtectedValue) {
        node.protectedValue = text;
        node.setAttribute(XmlNames.Attr.Protected, 'True');
    } else {
        setText(node, text);
    }
}

/**
 * Gets node protected text from inner text
 * @param {Node} node
 * @return {ProtectedValue|ArrayBuffer|{ref: string}} - protected value, or array buffer, or reference to binary
 */
function getProtectedBinary(node) {
    if (node.protectedValue) {
        return node.protectedValue;
    }
    var text = node.textContent;
    var ref = node.getAttribute(XmlNames.Attr.Ref);
    if (ref) {
        return { ref: ref };
    }
    if (!text) {
        return undefined;
    }
    var compressed = strToBoolean(node.getAttribute(XmlNames.Attr.Compressed));
    var bytes = ByteUtils.base64ToBytes(text);
    if (compressed) {
        bytes = pako.ungzip(bytes);
    }
    return ByteUtils.arrayToBuffer(bytes);
}

/**
 * Sets node protected binary
 * @param {Node} node
 * @param {ProtectedValue|ArrayBuffer|{ref: string}|string} binary
 */
function setProtectedBinary(node, binary) {
    if (binary instanceof ProtectedValue) {
        node.protectedValue = binary;
        node.setAttribute(XmlNames.Attr.Protected, 'True');
    } else if (binary && binary.ref) {
        node.setAttribute(XmlNames.Attr.Ref, binary.ref);
    } else {
        setBytes(node, binary);
    }
}

/**
 * Traversed XML tree with depth-first preorder search
 * @param {Node} node
 * @param {function} callback
 */
function traverse(node, callback) {
    callback(node);
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            traverse(childNode, callback);
        }
    }
}

/**
 * Reads protected values for all nodes in tree
 * @param {Node} node
 * @param {ProtectSaltGenerator} protectSaltGenerator
 */
function setProtectedValues(node, protectSaltGenerator) {
    traverse(node, function(node) {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.Protected))) {
            try {
                var value = ByteUtils.arrayToBuffer(ByteUtils.base64ToBytes(node.textContent));
                if (value.byteLength) {
                    var salt = protectSaltGenerator.getSalt(value.byteLength);
                    node.protectedValue = new ProtectedValue(value, salt);
                }
            } catch (e) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad protected value at line ' +
                node.lineNumber + ': ' + e);
            }
        }
    });
}

/**
 * Updates protected values salt for all nodes in tree which have protected values assigned
 * @param {Node} node
 * @param {ProtectSaltGenerator} protectSaltGenerator
 */
function updateProtectedValuesSalt(node, protectSaltGenerator) {
    traverse(node, function(node) {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.Protected)) && node.protectedValue) {
            var newSalt = protectSaltGenerator.getSalt(node.protectedValue.byteLength);
            node.protectedValue.setSalt(newSalt);
            node.textContent = node.protectedValue.toString();
        }
    });
}

/**
 * Unprotect protected values for all nodes in tree which have protected values assigned
 * @param {Node} node
 */
function unprotectValues(node) {
    traverse(node, function(node) {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.Protected)) && node.protectedValue) {
            node.removeAttribute(XmlNames.Attr.Protected);
            node.setAttribute(XmlNames.Attr.ProtectedInMemPlainXml, 'True');
            node.textContent = node.protectedValue.getText();
        }
    });
}

/**
 * Protect protected values back for all nodes in tree which have been unprotected
 * @param {Node} node
 */
function protectUnprotectedValues(node) {
    traverse(node, function(node) {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.ProtectedInMemPlainXml)) && node.protectedValue) {
            node.removeAttribute(XmlNames.Attr.ProtectedInMemPlainXml);
            node.setAttribute(XmlNames.Attr.Protected, 'True');
            node.textContent = node.protectedValue.toString();
        }
    });
}

/**
 * Protect plain values in xml for all nodes in tree which should be protected
 * @param {Node} node
 */
function protectPlainValues(node) {
    traverse(node, function(node) {
        if (strToBoolean(node.getAttribute(XmlNames.Attr.ProtectedInMemPlainXml))) {
            node.protectedValue = ProtectedValue.fromString(node.textContent);
            node.textContent = node.protectedValue.toString();
            node.removeAttribute(XmlNames.Attr.ProtectedInMemPlainXml);
            node.setAttribute(XmlNames.Attr.Protected, 'True');
        }
    });
}

module.exports.parse = parse;
module.exports.serialize = serialize;
module.exports.create = create;
module.exports.getChildNode = getChildNode;
module.exports.addChildNode = addChildNode;
module.exports.getText = getText;
module.exports.setText = setText;
module.exports.getBytes = getBytes;
module.exports.setBytes = setBytes;
module.exports.getDate = getDate;
module.exports.setDate = setDate;
module.exports.getNumber = getNumber;
module.exports.setNumber = setNumber;
module.exports.getBoolean = getBoolean;
module.exports.setBoolean = setBoolean;
module.exports.strToBoolean = strToBoolean;
module.exports.getUuid = getUuid;
module.exports.setUuid = setUuid;
module.exports.getProtectedText = getProtectedText;
module.exports.setProtectedText = setProtectedText;
module.exports.getProtectedBinary = getProtectedBinary;
module.exports.setProtectedBinary = setProtectedBinary;
module.exports.setProtectedValues = setProtectedValues;
module.exports.updateProtectedValuesSalt = updateProtectedValuesSalt;
module.exports.unprotectValues = unprotectValues;
module.exports.protectUnprotectedValues = protectUnprotectedValues;
module.exports.protectPlainValues = protectPlainValues;
