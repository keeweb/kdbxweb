'use strict';

var XmlNames = require('./../defs/xml-names'),
    XmlUtils = require('./../utils/xml-utils');

var KdbxCustomData = {
    /**
     * Reads custom data from xml
     * @param {Node} node - xml node
     * @returns {object} - custom data dictionary
     */
    read: function (node) {
        var customData = {};
        for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            var childNode = cn[i];
            if (childNode.tagName === XmlNames.Elem.StringDictExItem) {
                KdbxCustomData._readItem(childNode, customData);
            }
        }
        return customData;
    },

    /**
     * Writes custom data to xml
     * @param {Node} parentNode - xml node
     * @param {object} customData - custom data dictionary
     */
    write: function (parentNode, customData) {
        if (!customData) {
            return;
        }
        var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomData);
        Object.keys(customData).forEach(function (key) {
            var value = customData[key];
            if (value) {
                var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.StringDictExItem);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Key), key);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Value), value);
            }
        });
    },

    _readItem: function (node, customData) {
        var key, value;
        for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            var childNode = cn[i];
            switch (childNode.tagName) {
                case XmlNames.Elem.Key:
                    key = XmlUtils.getText(childNode);
                    break;
                case XmlNames.Elem.Value:
                    value = XmlUtils.getText(childNode);
                    break;
            }
        }
        if (key) {
            customData[key] = value;
        }
    }
};

module.exports = KdbxCustomData;
