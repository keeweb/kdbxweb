'use strict';

module.exports = function(content) {
    this.cacheable && this.cacheable();
    return 'module.exports = "' + content.toString('base64') + '"';
};

module.exports.raw = true;
