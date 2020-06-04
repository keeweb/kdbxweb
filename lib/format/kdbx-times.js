'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils');

/**
 * Kdbx times
 * @constructor
 */
var KdbxTimes = function () {
    this.creationTime = undefined;
    this.lastModTime = undefined;
    this.lastAccessTime = undefined;
    this.expiryTime = undefined;
    this.expires = undefined;
    this.usageCount = undefined;
    this.locationChanged = new Date();
    Object.preventExtensions(this);
};

KdbxTimes.prototype._readNode = function (node) {
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
 * Clones object
 * @returns {KdbxTimes}
 */
KdbxTimes.prototype.clone = function () {
    var clone = new KdbxTimes();
    clone.creationTime = this.creationTime;
    clone.lastModTime = this.lastModTime;
    clone.lastAccessTime = this.lastAccessTime;
    clone.expiryTime = this.expiryTime;
    clone.expires = this.expires;
    clone.usageCount = this.usageCount;
    clone.locationChanged = this.locationChanged;
    return clone;
};

KdbxTimes.prototype.update = function () {
    var now = new Date();
    this.lastModTime = now;
    this.lastAccessTime = now;
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxTimes.prototype.write = function (parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Times);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.CreationTime), this.creationTime);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LastModTime), this.lastModTime);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LastAccessTime), this.lastAccessTime);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.ExpiryTime), this.expiryTime);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.Expires), this.expires);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.UsageCount), this.usageCount);
    ctx.setXmlDate(
        XmlUtils.addChildNode(node, XmlNames.Elem.LocationChanged),
        this.locationChanged
    );
};

/**
 * Creates new times
 * @return {KdbxTimes}
 */
KdbxTimes.create = function () {
    var times = new KdbxTimes();
    var now = new Date();
    times.creationTime = now;
    times.lastModTime = now;
    times.lastAccessTime = now;
    times.expiryTime = now;
    times.expires = false;
    times.usageCount = 0;
    times.locationChanged = now;
    return times;
};

/**
 * Read times from xml
 * @param {Node} xmlNode
 * @return {KdbxTimes}
 */
KdbxTimes.read = function (xmlNode) {
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
