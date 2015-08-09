'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils');

/**
 * Kdbx times
 * @constructor
 */
var KdbxTimes = function() {
    this.creationTime = undefined;
    this.lastModTime = undefined;
    this.lastAccessTime = undefined;
    this.expiryTime = undefined;
    this.expires = undefined;
    this.usageCount = undefined;
    this.locationChanged = undefined;
    Object.preventExtensions(this);
};

KdbxTimes.prototype._readNode = function(node) {
    switch (node.tagName) {
        case XmlNames.Elem.CreationTime:
            this.creationTime = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.LastModTime:
            this.lastModTime = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.LastAccessTime:
            this.lastAccessTime = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.ExpiryTime:
            this.expiryTime = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.Expires:
            this.expires = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.UsageCount:
            this.usageCount = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.LocationChanged:
            this.locationChanged = XmlUtils.getDate(node);
            break;
    }
};

/**
 * Read times from xml
 * @param {Node} xmlNode
 * @return {KdbxTimes}
 */
KdbxTimes.read = function(xmlNode) {
    var obj = new KdbxTimes();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            obj._readNode(childNode);
        }
    }
    return obj;
};

module.exports = KdbxTimes;
