'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils');

/**
 * Deleted object
 * @constructor
 */
var KdbxDeletedObject = function () {
    this.uuid = undefined;
    this.deletionTime = undefined;
    Object.preventExtensions(this);
};

KdbxDeletedObject.prototype._readNode = function (node) {
    switch (node.tagName) {
        case XmlNames.Elem.Uuid:
            this.uuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.DeletionTime:
            this.deletionTime = XmlUtils.getDate(node);
            break;
    }
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxDeletedObject.prototype.write = function (parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.DeletedObject);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DeletionTime), this.deletionTime);
};

/**
 * Read deleted object from xml
 * @param {Node} xmlNode
 * @return {KdbxTimes}
 */
KdbxDeletedObject.read = function (xmlNode) {
    var obj = new KdbxDeletedObject();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            obj._readNode(childNode);
        }
    }
    return obj;
};

module.exports = KdbxDeletedObject;
