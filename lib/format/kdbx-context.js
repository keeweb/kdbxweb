'use strict';

var XmlUtils = require('../utils/xml-utils');

/**
 * Context with helper methods for load/save
 * @param {Kdbx} opts.kdbx - kdbx file
 * @param {boolean} [opts.exportXml=false] - whether we are exporting as xml
 * @constructor
 */
var KdbxContext = function (opts) {
    this.kdbx = opts.kdbx;
    this.exportXml = opts.exportXml || false;
};

/**
 * Sets XML date, respecting date saving settings
 * @param {Node} node
 * @param {Date} dt
 */
KdbxContext.prototype.setXmlDate = function (node, dt) {
    var isBinary = this.kdbx.header.versionMajor >= 4 && !this.exportXml;
    XmlUtils.setDate(node, dt, isBinary);
};

module.exports = KdbxContext;
