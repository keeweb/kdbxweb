'use strict';

var KdbxError = require('./../errors/kdbx-error'),
    Consts = require('./../defs/consts'),
    XmlNames = require('../defs/xml-names'),
    KdbxUuid = require('./../format/kdbx-uuid'),
    ProtectedValue = require('./../crypto/protected-value'),
    ByteUtils = require('./byte-utils'),
    pako = require('pako');

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
    if (bytes instanceof String) {
        bytes = ByteUtils.base64ToBytes(bytes);
    }
    setText(node, bytes ? ByteUtils.bytesToBase64(ByteUtils.arrayToBuffer(bytes)) : undefined);
}

/**
 * Parses date saved by KeePass from XML
 * @param {Node} node - xml node with date saved by KeePass (ISO format)
 * @return {Date} - date or undefined, if the tag is empty
 */
function getDate(node) {
    var text = getText(node);
    return text ? new Date(text) : undefined;
}

/**
 * Sets node date
 * @param {Node} node
 * @param {Date|undefined} date
 */
function setDate(node, date) {
    setText(node, date ? date.toISOString() : undefined);
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
    setText(node, typeof number === 'number' ? number.toString() : undefined);
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
    setText(node, boolean ? 'True' : 'False');
}

/**
 * Converts saved string to boolean
 * @param {string} str
 * @returns {boolean}
 */
function strToBoolean(str) {
    return str === 'True';
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
                if (value) {
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
