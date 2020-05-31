/*! kdbxweb v1.7.1, (c) 2020 Antelle, opensource.org/licenses/MIT */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("crypto"), require("xmldom"));
	else if(typeof define === 'function' && define.amd)
		define(["crypto", "xmldom"], factory);
	else if(typeof exports === 'object')
		exports["kdbxweb"] = factory(require("crypto"), require("xmldom"));
	else
		root["kdbxweb"] = factory(root["crypto"], root["xmldom"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__42__, __WEBPACK_EXTERNAL_MODULE__44__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 29);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*****************************!*\
  !*** ./utils/byte-utils.js ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var TextEncoder = global.TextEncoder;
var TextDecoder = global.TextDecoder;

if (!TextEncoder || !TextDecoder) {
    var textEncoding = __webpack_require__(/*! text-encoding */ 40);
    TextEncoder = textEncoding.TextEncoder;
    TextDecoder = textEncoding.TextDecoder;
}

var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();

/**
 * Checks if two ArrayBuffers are equal
 * @param {ArrayBuffer} ab1
 * @param {ArrayBuffer} ab2
 * @returns {boolean}
 */
function arrayBufferEquals(ab1, ab2) {
    if (ab1.byteLength !== ab2.byteLength) {
        return false;
    }
    var arr1 = new Uint8Array(ab1);
    var arr2 = new Uint8Array(ab2);
    for (var i = 0, len = arr1.length; i < len; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Converts Array or ArrayBuffer to string
 * @param {Array|Uint8Array|ArrayBuffer} arr
 * @return {string}
 */
function bytesToString(arr) {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    return textDecoder.decode(arr);
}

/**
 * Converts string to byte array
 * @param {string} str
 * @return {Uint8Array}
 */
function stringToBytes(str) {
    return textEncoder.encode(str);
}

/**
 * Converts base64 string to array
 * @param {string} str
 * @return {Uint8Array}
 */
function base64ToBytes(str) {
    if (typeof atob === 'undefined' && typeof Buffer === 'function') {
        // node.js doesn't have atob
        var buffer = Buffer.from(str, 'base64');
        return new Uint8Array(buffer);
    }
    var byteStr = atob(str);
    var arr = new Uint8Array(byteStr.length);
    for (var i = 0; i < byteStr.length; i++) {
        arr[i] = byteStr.charCodeAt(i);
    }
    return arr;
}

/**
 * Converts Array or ArrayBuffer to base64-string
 * @param {Array|Uint8Array|ArrayBuffer} arr
 * @return {string}
 */
function bytesToBase64(arr) {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    if (typeof btoa === 'undefined' && typeof Buffer === 'function') {
        // node.js doesn't have btoa
        var buffer = Buffer.from(arr);
        return buffer.toString('base64');
    }
    var str = '';
    for (var i = 0; i < arr.length; i++) {
        str += String.fromCharCode(arr[i]);
    }
    return btoa(str);
}

/**
 * Convert hex-string to byte array
 * @param {string} hex
 * @return Uint8Array
 */
function hexToBytes(hex) {
    var arr = new Uint8Array(Math.ceil(hex.length / 2));
    for (var i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return arr;
}

/**
 * Convert hex-string to byte array
 * @param {Array|Uint8Array|ArrayBuffer} arr
 * @return {string}
 */
function bytesToHex(arr) {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    var str = '';
    for (var i = 0; i < arr.length; i++) {
        var byte = arr[i].toString(16);
        if (byte.length === 1) {
            str += '0';
        }
        str += byte;
    }
    return str;
}

/**
 * Converts byte array to array buffer
 * @param {Uint8Array|ArrayBuffer} arr
 * @returns {ArrayBuffer}
 */
function arrayToBuffer(arr) {
    if (arr instanceof ArrayBuffer) {
        return arr;
    }
    var ab = arr.buffer;
    if (arr.byteOffset === 0 && arr.byteLength === ab.byteLength) {
        return ab;
    }
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

/**
 * Fills array or arraybuffer with zeroes
 * @param {Uint8Array|ArrayBuffer} buffer
 */
function zeroBuffer(buffer) {
    if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
    }
    buffer.fill(0);
}

module.exports.arrayBufferEquals = arrayBufferEquals;
module.exports.bytesToString = bytesToString;
module.exports.stringToBytes = stringToBytes;
module.exports.base64ToBytes = base64ToBytes;
module.exports.bytesToBase64 = bytesToBase64;
module.exports.hexToBytes = hexToBytes;
module.exports.bytesToHex = bytesToHex;
module.exports.arrayToBuffer = arrayToBuffer;
module.exports.zeroBuffer = zeroBuffer;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/global.js */ 13)))

/***/ }),
/* 1 */
/*!************************!*\
  !*** ./defs/consts.js ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports.Signatures = {
    FileMagic: 0x9AA2D903,
    Sig2Kdbx: 0xB54BFB67,
    Sig2Kdb: 0xB54BFB65
};

module.exports.ErrorCodes = {
    NotImplemented: 'NotImplemented',
    InvalidArg: 'InvalidArg',
    BadSignature: 'BadSignature',
    InvalidVersion: 'InvalidVersion',
    Unsupported: 'Unsupported',
    FileCorrupt: 'FileCorrupt',
    InvalidKey: 'InvalidKey',
    MergeError: 'MergeError'
};

module.exports.CompressionAlgorithm = {
    None: 0,
    GZip: 1
};

module.exports.CrsAlgorithm = {
    Null: 0,
    ArcFourVariant: 1,
    Salsa20: 2,
    ChaCha20: 3
};

module.exports.KdfId = {
    Argon2: '72Nt34wpREuR96mkA+MKDA==',
    Aes: 'ydnzmmKKRGC/dA0IwYpP6g=='
};

module.exports.CipherId = {
    Aes: 'McHy5r9xQ1C+WAUhavxa/w==',
    ChaCha20: '1gOKK4tvTLWlJDOaMdu1mg=='
};

module.exports.AutoTypeObfuscationOptions = {
    None: 0,
    UseClipboard: 1
};

module.exports.Defaults = {
    KeyEncryptionRounds: 300000,
    MntncHistoryDays: 365,
    HistoryMaxItems: 10,
    HistoryMaxSize: 6 * 1024 * 1024,
    RecycleBinName: 'Recycle Bin'
};

module.exports.Icons = {
    Key: 0,
    World: 1,
    Warning: 2,
    NetworkServer: 3,
    MarkedDirectory: 4,
    UserCommunication: 5,
    Parts: 6,
    Notepad: 7,
    WorldSocket: 8,
    Identity: 9,
    PaperReady: 10,
    Digicam: 11,
    IRCommunication: 12,
    MultiKeys: 13,
    Energy: 14,
    Scanner: 15,
    WorldStar: 16,
    CDRom: 17,
    Monitor: 18,
    EMail: 19,
    Configuration: 20,
    ClipboardReady: 21,
    PaperNew: 22,
    Screen: 23,
    EnergyCareful: 24,
    EMailBox: 25,
    Disk: 26,
    Drive: 27,
    PaperQ: 28,
    TerminalEncrypted: 29,
    Console: 30,
    Printer: 31,
    ProgramIcons: 32,
    Run: 33,
    Settings: 34,
    WorldComputer: 35,
    Archive: 36,
    Homebanking: 37,
    DriveWindows: 39,
    Clock: 39,
    EMailSearch: 40,
    PaperFlag: 41,
    Memory: 42,
    TrashBin: 43,
    Note: 44,
    Expired: 45,
    Info: 46,
    Package: 47,
    Folder: 48,
    FolderOpen: 49,
    FolderPackage: 50,
    LockOpen: 51,
    PaperLocked: 52,
    Checked: 53,
    Pen: 54,
    Thumbnail: 55,
    Book: 56,
    List: 57,
    UserKey: 58,
    Tool: 59,
    Home: 60,
    Star: 61,
    Tux: 62,
    Feather: 63,
    Apple: 64,
    Wiki: 65,
    Money: 66,
    Certificate: 67,
    BlackBerry: 68
};


/***/ }),
/* 2 */
/*!******************************!*\
  !*** ./errors/kdbx-error.js ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function KdbxError(code, message) {
    this.name = 'KdbxError';
    this.code = code;
    this.message = 'Error ' + code + (message ? ': ' + message : '');
}

KdbxError.prototype = Error.prototype;

module.exports = KdbxError;


/***/ }),
/* 3 */
/*!*********************************!*\
  !*** ./crypto/crypto-engine.js ***!
  \*********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0),
    KdbxError = __webpack_require__(/*! ../errors/kdbx-error */ 2),
    Consts = __webpack_require__(/*! ../defs/consts */ 1),
    ChaCha20 = __webpack_require__(/*! ./chacha20 */ 24);

var webCrypto = global.crypto;
var subtle = webCrypto ? webCrypto.subtle || webCrypto.webkitSubtle : null;
var nodeCrypto = global.process && global.process.versions && global.process.versions.node ? __webpack_require__(/*! crypto */ 42) : null;

var EmptySha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
var EmptySha512 = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce' +
    '47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';
// maxRandomQuota is the max number of random bytes you can asks for from the cryptoEngine
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
var maxRandomQuota = 65536;


/**
 * SHA-256 hash
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function sha256(data) {
    if (!data.byteLength) {
        return Promise.resolve(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes(EmptySha256)));
    }
    if (subtle) {
        return subtle.digest({ name: 'SHA-256' }, data);
    } else if (nodeCrypto) {
        return new Promise(function(resolve) {
            var sha = nodeCrypto.createHash('sha256');
            var hash = sha.update(Buffer.from(data)).digest();
            resolve(hash.buffer);
        });
    } else {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'SHA256 not implemented'));
    }
}

/**
 * SHA-512 hash
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function sha512(data) {
    if (!data.byteLength) {
        return Promise.resolve(ByteUtils.arrayToBuffer(ByteUtils.hexToBytes(EmptySha512)));
    }
    if (subtle) {
        return subtle.digest({ name: 'SHA-512' }, data);
    } else if (nodeCrypto) {
        return new Promise(function(resolve) {
            var sha = nodeCrypto.createHash('sha512');
            var hash = sha.update(Buffer.from(data)).digest();
            resolve(hash.buffer);
        });
    } else {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'SHA512 not implemented'));
    }
}

/**
 * HMAC-SHA-256 hash
 * @param {ArrayBuffer} key
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function hmacSha256(key, data) {
    if (subtle) {
        var algo = { name: 'HMAC', hash: { name: 'SHA-256' } };
        return subtle.importKey('raw', key, algo, false, ['sign'])
            .then(function(subtleKey) {
                return subtle.sign(algo, subtleKey, data);
            });
    } else if (nodeCrypto) {
        return new Promise(function(resolve) {
            var hmac = nodeCrypto.createHmac('sha256', Buffer.from(key));
            var hash = hmac.update(Buffer.from(data)).digest();
            resolve(hash.buffer);
        });
    } else {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'HMAC-SHA256 not implemented'));
    }
}

/**
 * AES-CBC using WebCrypto
 * @constructor
 */
function AesCbcSubtle() {
}

AesCbcSubtle.prototype.importKey = function(key) {
    var that = this;
    return subtle.importKey('raw', key, {name: 'AES-CBC'}, false, ['encrypt', 'decrypt'])
        .then(function(key) { that.key = key; });
};

AesCbcSubtle.prototype.encrypt = function(data, iv) {
    return subtle.encrypt({name: 'AES-CBC', iv: iv}, this.key, data);
};

AesCbcSubtle.prototype.decrypt = function(data, iv) {
    return subtle.decrypt({name: 'AES-CBC', iv: iv}, this.key, data)
        .catch(function() { throw new KdbxError(Consts.ErrorCodes.InvalidKey, 'invalid key'); });
};

/**
 * AES-CBC using node crypto
 * @constructor
 */
function AesCbcNode() {
}

AesCbcNode.prototype.importKey = function(key) {
    this.key = key;
    return Promise.resolve();
};

AesCbcNode.prototype.encrypt = function(data, iv) {
    var that = this;
    return Promise.resolve().then(function() {
        var cipher = nodeCrypto.createCipheriv('aes-256-cbc', Buffer.from(that.key), Buffer.from(iv));
        var block = cipher.update(Buffer.from(data));
        return ByteUtils.arrayToBuffer(Buffer.concat([block, cipher.final()]));
    });
};

AesCbcNode.prototype.decrypt = function(data, iv) {
    var that = this;
    return Promise.resolve().then(function() {
        var cipher = nodeCrypto.createDecipheriv('aes-256-cbc', Buffer.from(that.key), Buffer.from(iv));
        var block = cipher.update(Buffer.from(data));
        return ByteUtils.arrayToBuffer(Buffer.concat([block, cipher.final()]));
    }).catch(function() { throw new KdbxError(Consts.ErrorCodes.InvalidKey, 'invalid key'); });
};

/**
 * Creates AES-CBC implementation
 * @returns AesCbc
 */
function createAesCbc() {
    if (subtle) {
        return new AesCbcSubtle();
    } else if (nodeCrypto) {
        return new AesCbcNode();
    } else {
        throw new KdbxError(Consts.ErrorCodes.NotImplemented, 'AES-CBC not implemented');
    }
}

/**
 * Gets random bytes from the CryptoEngine
 * @param {number} len - bytes count
 * @return {Uint8Array} - random bytes
 */
function safeRandom(len) {
    var randomBytes = new Uint8Array(len);
    while (len > 0) {
        var segmentSize = len % maxRandomQuota;
        segmentSize = segmentSize > 0 ? segmentSize : maxRandomQuota;
        var randomBytesSegment = new Uint8Array(segmentSize);
        webCrypto.getRandomValues(randomBytesSegment);
        len -= segmentSize;
        randomBytes.set(randomBytesSegment, len);
    }
    return randomBytes;
}

/**
 * Generates random bytes of specified length
 * @param {Number} len
 * @returns {Uint8Array}
 */
function random(len) {
    if (subtle) {
        return safeRandom(len);
    } else if (nodeCrypto) {
        return new Uint8Array(nodeCrypto.randomBytes(len));
    } else {
        throw new KdbxError(Consts.ErrorCodes.NotImplemented, 'Random not implemented');
    }
}

/**
 * Encrypts with ChaCha20
 * @param {ArrayBuffer} data
 * @param {ArrayBuffer} key
 * @param {ArrayBuffer} iv
 * @returns {Promise.<ArrayBuffer>}
 */
function chacha20(data, key, iv) {
    return Promise.resolve().then(function() {
        var algo = new ChaCha20(new Uint8Array(key), new Uint8Array(iv));
        return ByteUtils.arrayToBuffer(algo.encrypt(new Uint8Array(data)));
    });
}

/**
 * Argon2 hash
 * @param {ArrayBuffer} password
 * @param {ArrayBuffer} salt
 * @param {Number} memory - memory in KiB
 * @param {Number} iterations - number of iterations
 * @param {Number} length - hash length
 * @param {Number} parallelism - threads count (threads will be emulated if they are not supported)
 * @param {Number} type - 0 = argon2d, 1 = argon2i
 * @param {Number} version - 0x10 or 0x13
 * @returns {Promise.<ArrayBuffer>}
 */
function argon2(password, salt, memory, iterations, length, parallelism, type, version) { // jshint ignore:line
    return Promise.reject(new KdbxError(Consts.ErrorCodes.NotImplemented, 'Argon2 not implemented'));
}

/**
 * Configures globals, for tests
 */
function configure(newSubtle, newWebCrypto, newNodeCrypto) {
    subtle = newSubtle;
    webCrypto = newWebCrypto;
    nodeCrypto = newNodeCrypto;
}

module.exports.subtle = subtle;
module.exports.webCrypto = webCrypto;
module.exports.nodeCrypto = nodeCrypto;

module.exports.sha256 = sha256;
module.exports.sha512 = sha512;
module.exports.hmacSha256 = hmacSha256;
module.exports.random = random;
module.exports.createAesCbc = createAesCbc;
module.exports.chacha20 = chacha20;
module.exports.argon2 = argon2;

module.exports.configure = configure;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/global.js */ 13)))

/***/ }),
/* 4 */
/*!****************************!*\
  !*** ./utils/xml-utils.js ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var KdbxError = __webpack_require__(/*! ./../errors/kdbx-error */ 2),
    Consts = __webpack_require__(/*! ./../defs/consts */ 1),
    XmlNames = __webpack_require__(/*! ../defs/xml-names */ 6),
    KdbxUuid = __webpack_require__(/*! ./../format/kdbx-uuid */ 7),
    ProtectedValue = __webpack_require__(/*! ./../crypto/protected-value */ 9),
    ByteUtils = __webpack_require__(/*! ./byte-utils */ 0),
    Int64 = __webpack_require__(/*! ./int64 */ 8),
    pako = __webpack_require__(/*! pako */ 16);

var dateRegex = /\.\d\d\d/;

var dom = global.DOMParser ? global : __webpack_require__(/*! xmldom */ 44);
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
 * @param {boolean} [prettyPrint=false] - whether to add whitespace around tags
 * @returns {string} - xml content
 */
function serialize(doc, prettyPrint) {
    if (prettyPrint) {
        prettyPrintXmlNode(doc, 0);
    }
    var xml = new dom.XMLSerializer().serializeToString(doc);
    if (prettyPrint && xml.startsWith('<?')) {
        xml = xml.replace(/^(<\?.*?\?>)</, '$1\n<');
    }
    return xml;
}

function prettyPrintXmlNode(node, indentationLevel) {
    var numChildNodes = node.childNodes.length;

    if (numChildNodes === 0) {
        return;
    }

    var formatStr = '\n' + '    '.repeat(indentationLevel);
    var prevFormatStr = indentationLevel > 0 ? '\n' + '    '.repeat(indentationLevel - 1) : '';
    var doc = node.ownerDocument || node;

    var childNodes = [];
    var childNode;

    for (var i = 0; i < numChildNodes; i++) {
        childNode = node.childNodes[i];
        if (childNode.nodeType !== doc.TEXT_NODE && childNode.nodeType !== doc.PROCESSING_INSTRUCTION_NODE) {
            childNodes.push(childNode);
        }
    }

    for (var j = 0; j < childNodes.length; j++) {
        childNode = childNodes[j];

        var isFirstDocumentNode = indentationLevel === 0 && j === 0;
        if (!isFirstDocumentNode) {
            var textNodeBefore = doc.createTextNode(formatStr);
            node.insertBefore(textNodeBefore, childNode);
        }

        if (!childNode.nextSibling && indentationLevel > 0) {
            var textNodeAfter = doc.createTextNode(prevFormatStr);
            node.appendChild(textNodeAfter);
        }

        prettyPrintXmlNode(childNode, indentationLevel + 1);
    }
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/global.js */ 13)))

/***/ }),
/* 5 */
/*!************************************************!*\
  !*** ../node_modules/pako/lib/utils/common.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');


exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (source.hasOwnProperty(p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);


/***/ }),
/* 6 */
/*!***************************!*\
  !*** ./defs/xml-names.js ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    Elem: {
        DocNode: 'KeePassFile',

        Meta: 'Meta',
        Root: 'Root',
        Group: 'Group',
        Entry: 'Entry',

        Generator: 'Generator',
        HeaderHash: 'HeaderHash',
        SettingsChanged: 'SettingsChanged',
        DbName: 'DatabaseName',
        DbNameChanged: 'DatabaseNameChanged',
        DbDesc: 'DatabaseDescription',
        DbDescChanged: 'DatabaseDescriptionChanged',
        DbDefaultUser: 'DefaultUserName',
        DbDefaultUserChanged: 'DefaultUserNameChanged',
        DbMntncHistoryDays: 'MaintenanceHistoryDays',
        DbColor: 'Color',
        DbKeyChanged: 'MasterKeyChanged',
        DbKeyChangeRec: 'MasterKeyChangeRec',
        DbKeyChangeForce: 'MasterKeyChangeForce',
        RecycleBinEnabled: 'RecycleBinEnabled',
        RecycleBinUuid: 'RecycleBinUUID',
        RecycleBinChanged: 'RecycleBinChanged',
        EntryTemplatesGroup: 'EntryTemplatesGroup',
        EntryTemplatesGroupChanged: 'EntryTemplatesGroupChanged',
        HistoryMaxItems: 'HistoryMaxItems',
        HistoryMaxSize: 'HistoryMaxSize',
        LastSelectedGroup: 'LastSelectedGroup',
        LastTopVisibleGroup: 'LastTopVisibleGroup',

        MemoryProt: 'MemoryProtection',
        ProtTitle: 'ProtectTitle',
        ProtUserName: 'ProtectUserName',
        ProtPassword: 'ProtectPassword',
        ProtUrl: 'ProtectURL',
        ProtNotes: 'ProtectNotes',

        CustomIcons: 'CustomIcons',
        CustomIconItem: 'Icon',
        CustomIconItemID: 'UUID',
        CustomIconItemData: 'Data',

        AutoType: 'AutoType',
        History: 'History',

        Name: 'Name',
        Notes: 'Notes',
        Uuid: 'UUID',
        Icon: 'IconID',
        CustomIconID: 'CustomIconUUID',
        FgColor: 'ForegroundColor',
        BgColor: 'BackgroundColor',
        OverrideUrl: 'OverrideURL',
        Times: 'Times',
        Tags: 'Tags',

        CreationTime: 'CreationTime',
        LastModTime: 'LastModificationTime',
        LastAccessTime: 'LastAccessTime',
        ExpiryTime: 'ExpiryTime',
        Expires: 'Expires',
        UsageCount: 'UsageCount',
        LocationChanged: 'LocationChanged',

        GroupDefaultAutoTypeSeq: 'DefaultAutoTypeSequence',
        EnableAutoType: 'EnableAutoType',
        EnableSearching: 'EnableSearching',

        String: 'String',
        Binary: 'Binary',
        Key: 'Key',
        Value: 'Value',

        AutoTypeEnabled: 'Enabled',
        AutoTypeObfuscation: 'DataTransferObfuscation',
        AutoTypeDefaultSeq: 'DefaultSequence',
        AutoTypeItem: 'Association',
        Window: 'Window',
        KeystrokeSequence: 'KeystrokeSequence',

        Binaries: 'Binaries',

        IsExpanded: 'IsExpanded',
        LastTopVisibleEntry: 'LastTopVisibleEntry',

        DeletedObjects: 'DeletedObjects',
        DeletedObject: 'DeletedObject',
        DeletionTime: 'DeletionTime',

        CustomData: 'CustomData',
        StringDictExItem: 'Item'
    },

    Attr: {
        Id: 'ID',
        Ref: 'Ref',
        Protected: 'Protected',
        ProtectedInMemPlainXml: 'ProtectInMemory',
        Compressed: 'Compressed'
    },

    Val: {
        False: 'False',
        True: 'True'
    }
};


/***/ }),
/* 7 */
/*!*****************************!*\
  !*** ./format/kdbx-uuid.js ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0),
    Random = __webpack_require__(/*! ../crypto/random */ 10);

var UuidLength = 16;

/**
 * Uuid for passwords
 * @param {ArrayBuffer|string} ab - ArrayBuffer with data
 * @constructor
 */
function KdbxUuid(ab) {
    if (ab === undefined) {
        ab = new ArrayBuffer(UuidLength);
    }
    if (typeof ab === 'string') {
        ab = ByteUtils.base64ToBytes(ab);
    }
    this.id = ab.byteLength === 16 ? ByteUtils.bytesToBase64(ab) : undefined;
    this.empty = true;
    if (ab) {
        var bytes = new Uint8Array(ab);
        for (var i = 0, len = bytes.length; i < len; i++) {
            if (bytes[i] !== 0) {
                this.empty = false;
                return;
            }
        }
    }
}

/**
 * Checks whether two uuids are equal
 * @param {KdbxUuid|string} other
 */
KdbxUuid.prototype.equals = function(other) {
    return other && other.toString() === this.toString() || false;
};

Object.defineProperty(KdbxUuid.prototype, 'bytes', {
    enumerable: true,
    get: function() {
        return ByteUtils.base64ToBytes(this.id);
    }
});

/**
 * Generated random uuid
 * @return {KdbxUuid}
 * @static
 */
KdbxUuid.random = function() {
    return new KdbxUuid(Random.getBytes(UuidLength));
};

KdbxUuid.prototype.toString = function() {
    return this.id;
};

KdbxUuid.prototype.valueOf = function() {
    return this.id;
};

KdbxUuid.prototype.toBytes = function() {
    return this.id ? ByteUtils.base64ToBytes(this.id) : undefined;
};

module.exports = KdbxUuid;


/***/ }),
/* 8 */
/*!************************!*\
  !*** ./utils/int64.js ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Represents 64-bit number
 * @param {number} [lo=0]
 * @param {number} [hi=0]
 * @constructor
 */
function Int64(lo, hi) {
    this.lo = lo || 0;
    this.hi = hi || 0;
}

/**
 * Number value as float
 * @returns {Number}
 */
Object.defineProperty(Int64.prototype, 'value', {
    enumerable: true,
    get: function() {
        if (this.hi) {
            if (this.hi >= 0x200000) {
                throw new Error('too large number');
            }
            return this.hi * 0x100000000 + this.lo;
        }
        return this.lo;
    }
});

/**
 * Gets number value
 * @returns {Number}
 */
Int64.prototype.valueOf = function() {
    return this.value;
};

/**
 * Creates int64 from number
 * @param {number} value
 * @returns {Int64}
 * @static
 */
Int64.from = function(value) {
    if (value > 0x1fffffffffffff) {
        throw new Error('too large number');
    }
    var lo = value >>> 0;
    var hi = ((value - lo) / 0x100000000) >>> 0;
    return new Int64(lo, hi);
};

module.exports = Int64;


/***/ }),
/* 9 */
/*!***********************************!*\
  !*** ./crypto/protected-value.js ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0),
    CryptoEngine = __webpack_require__(/*! ./crypto-engine */ 3),
    Random = __webpack_require__(/*! ./random */ 10);

/**
 * Protected value, used for protected entry fields
 * @param {ArrayBuffer} value - encrypted value
 * @param {ArrayBuffer} salt - salt bytes
 * @constructor
 */
var ProtectedValue = function(value, salt) {
    Object.defineProperty(this, '_value', { value: new Uint8Array(value) });
    Object.defineProperty(this, '_salt', { value: new Uint8Array(salt) });
};

/**
 * Returns protected value as base64 string
 * @returns {string}
 */
ProtectedValue.prototype.toString = function() {
    return ByteUtils.bytesToBase64(this._value);
};

/**
 * Creates protected value from string with new random salt
 * @param {string} str
 */
ProtectedValue.fromString = function(str) {
    var bytes = ByteUtils.stringToBytes(str),
        salt = Random.getBytes(bytes.length);
    for (var i = 0, len = bytes.length; i < len; i++) {
        bytes[i] ^= salt[i];
    }
    return new ProtectedValue(ByteUtils.arrayToBuffer(bytes), ByteUtils.arrayToBuffer(salt));
};

/**
 * Creates protected value from binary with new random salt
 * @param {ArrayBuffer} binary
 */
ProtectedValue.fromBinary = function(binary) {
    var bytes = new Uint8Array(binary),
        salt = Random.getBytes(bytes.length);
    for (var i = 0, len = bytes.length; i < len; i++) {
        bytes[i] ^= salt[i];
    }
    return new ProtectedValue(ByteUtils.arrayToBuffer(bytes), ByteUtils.arrayToBuffer(salt));
};

/**
 * Determines whether the value is included as substring (safe check; doesn't decrypt full string)
 * @param {string} str
 * @return {boolean}
 */
ProtectedValue.prototype.includes = function(str) {
    if (str.length === 0) {
        return false;
    }
    var source = this._value,
        salt = this._salt,
        search = ByteUtils.stringToBytes(str),
        sourceLen = source.length, searchLen = search.length, maxPos = sourceLen - searchLen,
        sourceIx, searchIx;
    src: for (sourceIx = 0; sourceIx <= maxPos; sourceIx++) {
        for (searchIx = 0; searchIx < searchLen; searchIx++) {
            if ((source[sourceIx + searchIx] ^ salt[sourceIx + searchIx]) !== search[searchIx]) {
                continue src;
            }
        }
        return true;
    }
    return false;
};

/**
 * Calculates SHA256 hash of saved value
 * @return {Promise.<ArrayBuffer>}
 */
ProtectedValue.prototype.getHash = function() {
    var binary = ByteUtils.arrayToBuffer(this.getBinary());
    return CryptoEngine.sha256(binary).then(function(hash) {
        ByteUtils.zeroBuffer(binary);
        return hash;
    });
};

/**
 * Decrypted text
 * @returns {string}
 */
ProtectedValue.prototype.getText = function() {
    return ByteUtils.bytesToString(this.getBinary());
};

/**
 * Decrypted binary. Don't forget to zero it after usage
 * @returns {Uint8Array}
 */
ProtectedValue.prototype.getBinary = function() {
    var value = this._value, salt = this._salt;
    var bytes = new Uint8Array(value.byteLength);
    for (var i = bytes.length - 1; i >= 0; i--) {
        bytes[i] = value[i] ^ salt[i];
    }
    return bytes;
};

/**
 * Sets new salt
 * @param {ArrayBuffer} newSalt
 */
ProtectedValue.prototype.setSalt = function(newSalt) {
    var newSaltArr = new Uint8Array(newSalt);
    var value = this._value, salt = this._salt;
    for (var i = 0, len = value.length; i < len; i++) {
        value[i] = value[i] ^ salt[i] ^ newSaltArr[i];
        salt[i] = newSaltArr[i];
    }
};

/**
 * Clones object
 * @return {ProtectedValue}
 */
ProtectedValue.prototype.clone = function() {
    return new ProtectedValue(this._value, this._salt);
};

/**
 * Value byte length
 */
Object.defineProperty(ProtectedValue.prototype, 'byteLength', {
    enumerable: true,
    get: function() {
        return this._value.byteLength;
    }
});

module.exports = ProtectedValue;


/***/ }),
/* 10 */
/*!**************************!*\
  !*** ./crypto/random.js ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Salsa20 = __webpack_require__(/*! ./salsa20 */ 23),
    CryptoEngine = __webpack_require__(/*! ./crypto-engine */ 3);

var key = new Uint8Array(32), nonce = new Uint8Array(8);
for (var i = 0; i < key.length; i++) {
    key[i] = Math.random() * 0xff;
}
for (var j = 0; j < nonce.length; j++) {
    nonce[i] = Math.random() * 0xff;
}
var algo = new Salsa20(key, nonce);

/**
 * Gets random bytes
 * @param {number} len - bytes count
 * @return {Uint8Array} - random bytes
 */
function getBytes(len) {
    if (!len) {
        return new Uint8Array(0);
    }
    algo.getBytes(Math.round(Math.random() * len) + 1);
    var result = algo.getBytes(len);
    var cryptoBytes = CryptoEngine.random(len);
    for (var i = cryptoBytes.length - 1; i >= 0; --i) {
        result[i] ^= cryptoBytes[i];
    }
    return result;
}

module.exports.getBytes = getBytes;


/***/ }),
/* 11 */
/*!********************************!*\
  !*** ./utils/binary-stream.js ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Stream for accessing array buffer with auto-advanced position
 * @param {ArrayBuffer} [arrayBuffer]
 * @constructor
 */
function BinaryStream(arrayBuffer) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(1024);
    this._dataView = new DataView(this._arrayBuffer);
    this._pos = 0;
    this._canExpand = !arrayBuffer;
}

['Int', 'Uint', 'Float'].forEach(function(type) {
    (type === 'Float' ? [4, 8] : [1, 2, 4]).forEach(function(bytes) {
        var getMethod = 'get' + type + bytes * 8;
        BinaryStream.prototype[getMethod] = function(littleEndian) {
            var res = this._dataView[getMethod].call(this._dataView, this._pos, littleEndian);
            this._pos += bytes;
            return res;
        };
        var setMethod = 'set' + type + bytes * 8;
        BinaryStream.prototype[setMethod] = function(value, littleEndian) {
            this._checkCapacity(bytes);
            this._dataView[setMethod].call(this._dataView, this._pos, value, littleEndian);
            this._pos += bytes;
        };
    });
});

BinaryStream.prototype.getUint64 = function(littleEndian) {
    var part1 = this.getUint32(littleEndian),
        part2 = this.getUint32(littleEndian);
    if (littleEndian) {
        part2 *= 0x100000000;
    } else {
        part1 *= 0x100000000;
    }
    return part1 + part2;
};

BinaryStream.prototype.setUint64 = function(value, littleEndian) {
    if (littleEndian) {
        this.setUint32(value & 0xffffffff, true);
        this.setUint32(Math.floor(value / 0x100000000), true);
    } else {
        this._checkCapacity(8);
        this.setUint32(Math.floor(value / 0x100000000), false);
        this.setUint32(value & 0xffffffff, false);
    }
};

BinaryStream.prototype.readBytes = function(size) {
    var buffer = this._arrayBuffer.slice(this._pos, this._pos + size);
    this._pos += size;
    return buffer;
};

BinaryStream.prototype.readBytesToEnd = function() {
    var size = this._arrayBuffer.byteLength - this._pos;
    return this.readBytes(size);
};

BinaryStream.prototype.readBytesNoAdvance = function(startPos, endPos) {
    return this._arrayBuffer.slice(startPos, endPos);
};

BinaryStream.prototype.writeBytes = function(bytes) {
    if (bytes instanceof ArrayBuffer) {
        bytes = new Uint8Array(bytes);
    }
    this._checkCapacity(bytes.length);
    new Uint8Array(this._arrayBuffer).set(bytes, this._pos);
    this._pos += bytes.length;
};

BinaryStream.prototype.getWrittenBytes = function() {
    return this._arrayBuffer.slice(0, this._pos);
};

BinaryStream.prototype._checkCapacity = function(addBytes) {
    var available = this._arrayBuffer.byteLength - this._pos;
    if (this._canExpand && available < addBytes) {
        var newLen = this._arrayBuffer.byteLength,
            requestedLen = this._pos + addBytes;
        while (newLen < requestedLen) {
            newLen *= 2;
        }
        var newData = new Uint8Array(newLen);
        newData.set(new Uint8Array(this._arrayBuffer));
        this._arrayBuffer = newData.buffer;
        this._dataView = new DataView(this._arrayBuffer);
    }
};

Object.defineProperty(BinaryStream.prototype, 'pos', {
    enumerable: true,
    get: function() {
        return this._pos;
    }
});

Object.defineProperty(BinaryStream.prototype, 'byteLength', {
    enumerable: true,
    get: function() {
        return this._arrayBuffer.byteLength;
    }
});

module.exports = BinaryStream;


/***/ }),
/* 12 */
/*!*************************************************!*\
  !*** ../node_modules/pako/lib/zlib/messages.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};


/***/ }),
/* 13 */
/*!*************************************************!*\
  !*** ../node_modules/webpack/buildin/global.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 14 */
/*!*********************************!*\
  !*** ./utils/var-dictionary.js ***!
  \*********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var KdbxError = __webpack_require__(/*! ../errors/kdbx-error */ 2);
var Consts = __webpack_require__(/*! ../defs/consts */ 1);
var ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0);
var Int64 = __webpack_require__(/*! ../utils/int64 */ 8);

var MaxSupportedVersion = 1;
var DefaultVersion = 0x0100;

/**
 * Value type
 * @enum
 */
var ValueType = {
    UInt32: 0x04,
    UInt64: 0x05,
    Bool: 0x08,
    Int32: 0x0C,
    Int64: 0x0D,
    String: 0x18,
    Bytes: 0x42
};

/**
 * Variant dictionary, capable to store/load different values from byte array
 * @constructor
 */
function VarDictionary() {
    this._items = [];
    this._dict = {};
    Object.preventExtensions(this);
}

/**
 * Available value types enum
 * @enum
 */
VarDictionary.ValueType = ValueType;

/**
 * Gets value or undefined
 * @param {string} key
 * @returns {*}
 */
VarDictionary.prototype.get = function(key) {
    var item = this._dict[key];
    return item ? item.value : undefined;
};

/**
 * Get all keys
 * @return {string[]} keys array
 */
VarDictionary.prototype.keys = function() {
    return this._items.map(function(item) { return item.key; });
};

/**
 * Keys count
 * @returns {Number}
 */
Object.defineProperty(VarDictionary.prototype, 'length', {
    enumberable: true,
    get: function() { return this._items.length; }
});

/**
 * Sets or replaces existing item
 * @param {String} key
 * @param {VarDictionary.ValueType|Number} type
 * @param {*} value
 */
VarDictionary.prototype.set = function(key, type, value) {
    switch (type) {
        case ValueType.UInt32:
            if (typeof value !== 'number' || value < 0) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.UInt64:
            if (!(value instanceof Int64)) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Bool:
            if (typeof value !== 'boolean') {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Int32:
            if (typeof value !== 'number') {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Int64:
            if (!(value instanceof Int64)) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.String:
            if (typeof value !== 'string') {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        case ValueType.Bytes:
            if (value instanceof Uint8Array) {
                value = ByteUtils.arrayToBuffer(value);
            }
            if (!(value instanceof ArrayBuffer)) {
                throw new KdbxError(Consts.ErrorCodes.InvalidArg);
            }
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.InvalidArg);
    }
    var item = { key: key, type: type, value: value };
    if (this._dict[key]) {
        var ix = this._items.indexOf(this._dict[key]);
        this._items.splice(ix, 1, item);
    } else {
        this._items.push(item);
    }
    this._dict[key] = item;
};

/**
 * Removes key from dictionary
 * @param {string} key
 */
VarDictionary.prototype.remove = function(key) {
    this._items = this._items.filter(function(item) { return item.key !== key; });
    delete this._dict[key];
};

/**
 * Reads dictionary from stream
 * @param {BinaryStream} stm
 * @returns {VarDictionary}
 * @static
 */
VarDictionary.read = function(stm) {
    var dict = new VarDictionary();
    dict._readVersion(stm);
    while (true) {
        var item = dict._readItem(stm);
        if (!item) {
            break;
        }
        dict._items.push(item);
        dict._dict[item.key] = item;
    }
    return dict;
};

VarDictionary.prototype._readVersion = function(stm) {
    stm.getUint8();
    var versionMajor = stm.getUint8();
    if (versionMajor === 0 || versionMajor > MaxSupportedVersion) {
        throw new KdbxError(Consts.ErrorCodes.InvalidVersion);
    }
};

VarDictionary.prototype._readItem = function(stm) {
    var type = stm.getUint8();
    if (!type) {
        return false;
    }
    var keyLength = stm.getInt32(true);
    if (keyLength <= 0) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad key length');
    }
    var key = ByteUtils.bytesToString(stm.readBytes(keyLength));
    var valueLength = stm.getInt32(true);
    if (valueLength < 0) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad value length');
    }
    var value;
    switch (type) {
        case ValueType.UInt32:
            if (valueLength !== 4) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad uint32');
            }
            value = stm.getUint32(true);
            break;
        case ValueType.UInt64:
            if (valueLength !== 8) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad uint64');
            }
            var loInt = stm.getUint32(true);
            var hiInt = stm.getUint32(true);
            value = new Int64(loInt, hiInt);
            break;
        case ValueType.Bool:
            if (valueLength !== 1) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad bool');
            }
            value = stm.getUint8() !== 0;
            break;
        case ValueType.Int32:
            if (valueLength !== 4) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad int32');
            }
            value = stm.getInt32(true);
            break;
        case ValueType.Int64:
            if (valueLength !== 8) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad int64');
            }
            var loUint = stm.getUint32(true);
            var hiUint = stm.getUint32(true);
            value = new Int64(loUint, hiUint);
            break;
        case ValueType.String:
            value = ByteUtils.bytesToString(stm.readBytes(valueLength));
            break;
        case ValueType.Bytes:
            value = stm.readBytes(valueLength);
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad value type: ' + type);
    }
    return { key: key, type: type, value: value };
};

/**
 * Writes self to binary stream
 * @param {BinaryStream} stm
 */
VarDictionary.prototype.write = function(stm) {
    this._writeVersion(stm);
    Object.keys(this._items).forEach(function(key) {
        this._writeItem(stm, this._items[key]);
    }, this);
    stm.setUint8(0);
};

VarDictionary.prototype._writeVersion = function(stm) {
    stm.setUint16(DefaultVersion, true);
};

VarDictionary.prototype._writeItem = function(stm, item) {
    stm.setUint8(item.type);
    var keyBytes = ByteUtils.stringToBytes(item.key);
    stm.setInt32(keyBytes.length, true);
    stm.writeBytes(keyBytes);
    switch (item.type) {
        case ValueType.UInt32:
            stm.setInt32(4, true);
            stm.setUint32(item.value, true);
            break;
        case ValueType.UInt64:
            stm.setInt32(8, true);
            stm.setUint32(item.value.lo, true);
            stm.setUint32(item.value.hi, true);
            break;
        case ValueType.Bool:
            stm.setInt32(1, true);
            stm.setUint8(item.value ? 1 : 0);
            break;
        case ValueType.Int32:
            stm.setInt32(4, true);
            stm.setInt32(item.value, true);
            break;
        case ValueType.Int64:
            stm.setInt32(8, true);
            stm.setUint32(item.value.lo, true);
            stm.setUint32(item.value.hi, true);
            break;
        case ValueType.String:
            var strBytes = ByteUtils.stringToBytes(item.value);
            stm.setInt32(strBytes.length, true);
            stm.writeBytes(strBytes);
            break;
        case ValueType.Bytes:
            var bytesBuffer = ByteUtils.arrayToBuffer(item.value);
            stm.setInt32(bytesBuffer.byteLength, true);
            stm.writeBytes(bytesBuffer);
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.Unsupported);
    }
};

module.exports = VarDictionary;


/***/ }),
/* 15 */
/*!************************************!*\
  !*** ./format/kdbx-custom-data.js ***!
  \************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var XmlNames = __webpack_require__(/*! ./../defs/xml-names */ 6),
    XmlUtils = __webpack_require__(/*! ./../utils/xml-utils */ 4);

var KdbxCustomData = {
    /**
     * Reads custom data from xml
     * @param {Node} node - xml node
     * @returns {object} - custom data dictionary
     */
    read: function(node) {
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
    write: function(parentNode, customData) {
        if (!customData) {
            return;
        }
        var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomData);
        Object.keys(customData).forEach(function(key) {
            var value = customData[key];
            if (value) {
                var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.StringDictExItem);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Key), key);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Value), value);
            }
        });
    },

    _readItem: function(node, customData) {
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


/***/ }),
/* 16 */
/*!*************************************!*\
  !*** ../node_modules/pako/index.js ***!
  \*************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Top level file is just a mixin of submodules & constants


var assign    = __webpack_require__(/*! ./lib/utils/common */ 5).assign;

var deflate   = __webpack_require__(/*! ./lib/deflate */ 32);
var inflate   = __webpack_require__(/*! ./lib/inflate */ 35);
var constants = __webpack_require__(/*! ./lib/zlib/constants */ 21);

var pako = {};

assign(pako, deflate, inflate, constants);

module.exports = pako;


/***/ }),
/* 17 */
/*!************************************************!*\
  !*** ../node_modules/pako/lib/zlib/adler32.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It doesn't worth to make additional optimizationa as in original.
// Small size is preferable.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;


/***/ }),
/* 18 */
/*!**********************************************!*\
  !*** ../node_modules/pako/lib/zlib/crc32.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.


// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;


/***/ }),
/* 19 */
/*!*************************************************!*\
  !*** ../node_modules/pako/lib/utils/strings.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// String encode/decode helpers



var utils = __webpack_require__(/*! ./common */ 5);


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safary
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new utils.Buf8(256);
for (var q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
exports.string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new utils.Buf8(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // use fallback for big arrays to avoid stack overflow
  if (len < 65537) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for (var i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
exports.buf2binstring = function (buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
exports.binstring2buf = function (str) {
  var buf = new utils.Buf8(str.length);
  for (var i = 0, len = buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
exports.buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
exports.utf8border = function (buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Fuckup - very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means vuffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};


/***/ }),
/* 20 */
/*!************************************************!*\
  !*** ../node_modules/pako/lib/zlib/zstream.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;


/***/ }),
/* 21 */
/*!**************************************************!*\
  !*** ../node_modules/pako/lib/zlib/constants.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};


/***/ }),
/* 22 */
/*!*******************************!*\
  !*** ./format/kdbx-header.js ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* Docs for the KDBX header schema:
 * https://keepass.info/help/kb/kdbx_4.html#innerhdr
 */

var KdbxUuid = __webpack_require__(/*! ./kdbx-uuid */ 7),
    Consts = __webpack_require__(/*! ./../defs/consts */ 1),
    ProtectedValue = __webpack_require__(/*! ./../crypto/protected-value */ 9),
    KdbxError = __webpack_require__(/*! ./../errors/kdbx-error */ 2),
    BinaryStream = __webpack_require__(/*! ./../utils/binary-stream */ 11),
    ByteUtils = __webpack_require__(/*! ./../utils/byte-utils */ 0),
    VarDictionary = __webpack_require__(/*! ./../utils/var-dictionary */ 14),
    Int64 = __webpack_require__(/*! ./../utils/int64 */ 8),
    Random = __webpack_require__(/*! ../crypto/random */ 10);

var HeaderFields = [
    { name: 'EndOfHeader' },

    { name: 'Comment' },
    { name: 'CipherID' },
    { name: 'CompressionFlags' },
    { name: 'MasterSeed' },
    { name: 'TransformSeed', ver: [3] },
    { name: 'TransformRounds', ver: [3] },
    { name: 'EncryptionIV' },
    { name: 'ProtectedStreamKey', ver: [3] },
    { name: 'StreamStartBytes', ver: [3] },
    { name: 'InnerRandomStreamID', ver: [3] },

    { name: 'KdfParameters', ver: [4] },
    { name: 'PublicCustomData', ver: [4] }
];

var InnerHeaderFields = [
    { name: 'EndOfHeader' },

    { name: 'InnerRandomStreamID' },
    { name: 'InnerRandomStreamKey' },
    { name: 'Binary', skipHeader: true }
];

var HeaderConst = {
    DefaultFileVersionMajor: 3,
    DefaultFileVersionMinor: 1,
    MaxFileVersionMajor: 4,
    MaxFileVersionMinor: 1,
    MaxSupportedVersion: 4,
    FlagBinaryProtected: 0x01,
    InnerHeaderBinaryFieldId: 0x03,

    DefaultKdfAlgo: Consts.KdfId.Argon2,
    DefaultKdfSaltLength: 32,
    DefaultKdfParallelism: 1,
    DefaultKdfIterations: 2,
    DefaultKdfMemory: 1024 * 1024,
    DefaultKdfVersion: 0x13
};

var LastMinorVersions = {
    3: 1,
    4: 0
};

/**
 * Binary file header reader/writer
 * @constructor
 */
var KdbxHeader = function() {
    this.versionMajor = undefined;
    this.versionMinor = undefined;
    this.dataCipherUuid = undefined;
    this.compression = undefined;
    this.masterSeed = undefined;
    this.transformSeed = undefined;
    this.keyEncryptionRounds = undefined;
    this.encryptionIV = undefined;
    this.protectedStreamKey = undefined;
    this.streamStartBytes = undefined;
    this.crsAlgorithm = undefined;
    this.endPos = undefined;
    this.kdfParameters = undefined;
    this.publicCustomData = undefined;
    Object.preventExtensions(this);
};

KdbxHeader.prototype._readSignature = function(stm) {
    if (stm.byteLength < 8) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'not enough data');
    }
    var sig1 = stm.getUint32(true), sig2 = stm.getUint32(true);
    if (!(sig1 === Consts.Signatures.FileMagic && sig2 === Consts.Signatures.Sig2Kdbx)) {
        throw new KdbxError(Consts.ErrorCodes.BadSignature);
    }
};

KdbxHeader.prototype._writeSignature = function(stm) {
    stm.setUint32(Consts.Signatures.FileMagic, true);
    stm.setUint32(Consts.Signatures.Sig2Kdbx, true);
};

KdbxHeader.prototype._readVersion = function(stm) {
    var versionMinor = stm.getUint16(true);
    var versionMajor = stm.getUint16(true);
    if (versionMajor > HeaderConst.MaxSupportedVersion) {
        throw new KdbxError(Consts.ErrorCodes.InvalidVersion);
    }
    this.versionMinor = versionMinor;
    this.versionMajor = versionMajor;
};

KdbxHeader.prototype._writeVersion = function(stm) {
    stm.setUint16(this.versionMinor, true);
    stm.setUint16(this.versionMajor, true);
};

KdbxHeader.prototype._readCipherID = function(bytes) {
    if (bytes.byteLength !== 16) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'cipher');
    }
    this.dataCipherUuid = new KdbxUuid(bytes);
};

KdbxHeader.prototype._writeCipherID = function(stm) {
    this._writeFieldSize(stm, 16);
    stm.writeBytes(this.dataCipherUuid.bytes);
};

KdbxHeader.prototype._readCompressionFlags = function(bytes) {
    var id = new DataView(bytes).getUint32(bytes, true);
    if (id < 0 || id >= Object.keys(Consts.CompressionAlgorithm).length) {
        throw new KdbxError(Consts.ErrorCodes.Unsupported, 'compression');
    }
    this.compression = id;
};

KdbxHeader.prototype._writeCompressionFlags = function(stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(this.compression, true);
};

KdbxHeader.prototype._readMasterSeed = function(bytes) {
    this.masterSeed = bytes;
};

KdbxHeader.prototype._writeMasterSeed = function(stm) {
    this._writeFieldBytes(stm, this.masterSeed);
};

KdbxHeader.prototype._readTransformSeed = function(bytes) {
    this.transformSeed = bytes;
};

KdbxHeader.prototype._writeTransformSeed = function(stm) {
    this._writeFieldBytes(stm, this.transformSeed);
};

KdbxHeader.prototype._readTransformRounds = function(bytes) {
    this.keyEncryptionRounds = new BinaryStream(bytes).getUint64(true);
};

KdbxHeader.prototype._writeTransformRounds = function(stm) {
    this._writeFieldSize(stm, 8);
    stm.setUint64(this.keyEncryptionRounds, true);
};

KdbxHeader.prototype._readEncryptionIV = function(bytes) {
    this.encryptionIV = bytes;
};

KdbxHeader.prototype._writeEncryptionIV = function(stm) {
    this._writeFieldBytes(stm, this.encryptionIV);
};

KdbxHeader.prototype._readProtectedStreamKey = function(bytes) {
    this.protectedStreamKey = bytes;
};

KdbxHeader.prototype._writeProtectedStreamKey = function(stm) {
    this._writeFieldBytes(stm, this.protectedStreamKey);
};

KdbxHeader.prototype._readStreamStartBytes = function(bytes) {
    this.streamStartBytes = bytes;
};

KdbxHeader.prototype._writeStreamStartBytes = function(stm) {
    this._writeFieldBytes(stm, this.streamStartBytes);
};

KdbxHeader.prototype._readInnerRandomStreamID = function(bytes) {
    this.crsAlgorithm = new DataView(bytes).getUint32(bytes, true);
};

KdbxHeader.prototype._writeInnerRandomStreamID = function(stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(this.crsAlgorithm, true);
};

KdbxHeader.prototype._readInnerRandomStreamKey = function(bytes) {
    this.protectedStreamKey = bytes;
};

KdbxHeader.prototype._writeInnerRandomStreamKey = function(stm) {
    this._writeFieldBytes(stm, this.protectedStreamKey);
};

KdbxHeader.prototype._readKdfParameters = function(bytes) {
    this.kdfParameters = VarDictionary.read(new BinaryStream(bytes));
};

KdbxHeader.prototype._writeKdfParameters = function(stm) {
    var innerStream = new BinaryStream();
    this.kdfParameters.write(innerStream);
    this._writeFieldBytes(stm, innerStream.getWrittenBytes());
};

KdbxHeader.prototype._readPublicCustomData = function(bytes) {
    this.publicCustomData = VarDictionary.read(new BinaryStream(bytes));
};

KdbxHeader.prototype._hasPublicCustomData = function() {
    return this.publicCustomData;
};

KdbxHeader.prototype._writePublicCustomData = function(stm) {
    if (this.publicCustomData) {
        var innerStream = new BinaryStream();
        this.publicCustomData.write(innerStream);
        this._writeFieldBytes(stm, innerStream.getWrittenBytes());
    }
};

KdbxHeader.prototype._readBinary = function(bytes, ctx) {
    var view = new DataView(bytes);
    var flags = view.getUint8(0);
    var isProtected = flags & HeaderConst.FlagBinaryProtected;
    var binaryData = bytes.slice(1); // Actual data comes after the flag byte

    var binary = isProtected ? ProtectedValue.fromBinary(binaryData) : binaryData;

    var binaryIndex = Object.keys(ctx.kdbx.binaries).length;
    ctx.kdbx.binaries[binaryIndex] = binary;
};

KdbxHeader.prototype._writeBinary = function(stm, ctx) {
    if (this.versionMajor < 4) {
        return;
    }
    var binaryHashes = ctx.kdbx.binaries.hashOrder;
    for (var index = 0; index < binaryHashes.length; index++) {
        stm.setUint8(HeaderConst.InnerHeaderBinaryFieldId);
        var binary = ctx.kdbx.binaries[binaryHashes[index]];
        if (!binary) {
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no binary ' + index);
        }
        if (binary instanceof ProtectedValue) {
            var binaryData = binary.getBinary();
            this._writeFieldSize(stm, binaryData.byteLength + 1);
            stm.setUint8(HeaderConst.FlagBinaryProtected);
            stm.writeBytes(binaryData);
            ByteUtils.zeroBuffer(binaryData);
        } else {
            binary = ByteUtils.arrayToBuffer(binary);
            this._writeFieldSize(stm, binary.byteLength + 1);
            stm.setUint8(0);
            stm.writeBytes(binary);
        }
    }
};

KdbxHeader.prototype._writeEndOfHeader = function(stm) {
    this._writeFieldSize(stm, 4);
    stm.setUint32(0x0d0ad0a);
};

KdbxHeader.prototype._readField = function(stm, fields, ctx) {
    var headerId = stm.getUint8();
    var size = this._readFieldSize(stm);
    var bytes;
    if (size > 0) {
        bytes = stm.readBytes(size);
    }

    var headerField = fields[headerId];
    if (headerField) {
        var method = this['_read' + headerField.name];
        if (method) {
            method.call(this, bytes, ctx);
        }
    }
    return headerId !== 0;
};

KdbxHeader.prototype._writeField = function(stm, headerId, fields, ctx) {
    var headerField = fields[headerId];
    if (headerField) {
        if (headerField.ver && headerField.ver.indexOf(this.versionMajor) < 0) {
            return;
        }
        var method = this['_write' + headerField.name];
        if (method) {
            var hasMethod = this['_has' + headerField.name];
            if (hasMethod && !hasMethod.call(this)) {
                return;
            }
            if (!headerField.skipHeader) {
                stm.setUint8(headerId);
            }
            method.call(this, stm, ctx);
        }
    }
};

KdbxHeader.prototype._readFieldSize = function(stm) {
    return this.versionMajor >= 4 ? stm.getUint32(true) : stm.getUint16(true);
};

KdbxHeader.prototype._writeFieldSize = function(stm, size) {
    if (this.versionMajor >= 4) {
        stm.setUint32(size, true);
    } else {
        stm.setUint16(size, true);
    }
};

KdbxHeader.prototype._writeFieldBytes = function(stm, bytes) {
    this._writeFieldSize(stm, bytes.byteLength);
    stm.writeBytes(bytes);
};

KdbxHeader.prototype._validate = function() {
    if (this.dataCipherUuid === undefined) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no cipher in header');
    }
    if (this.compression === undefined) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no compression in header');
    }
    if (!this.masterSeed) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no master seed in header');
    }
    if (this.versionMajor < 4 && !this.transformSeed) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no transform seed in header');
    }
    if (this.versionMajor < 4 && !this.keyEncryptionRounds) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no key encryption rounds in header');
    }
    if (!this.encryptionIV) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no encryption iv in header');
    }
    if (this.versionMajor < 4 && !this.protectedStreamKey) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no protected stream key in header');
    }
    if (this.versionMajor < 4 && !this.streamStartBytes) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no stream start bytes in header');
    }
    if (this.versionMajor < 4 && !this.crsAlgorithm) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no crs algorithm in header');
    }
    if (this.versionMajor >= 4 && !this.kdfParameters) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no kdf parameters in header');
    }
};

KdbxHeader.prototype._validateInner = function() {
    if (!this.protectedStreamKey) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no protected stream key in header');
    }
    if (!this.crsAlgorithm) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no crs algorithm in header');
    }
};

KdbxHeader.prototype._createKdfParameters = function(algo) {
    if (!algo) {
        algo = HeaderConst.DefaultKdfAlgo;
    }
    switch (algo) {
        case Consts.KdfId.Argon2:
            this.kdfParameters = new VarDictionary();
            this.kdfParameters.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Argon2));
            this.kdfParameters.set('S', VarDictionary.ValueType.Bytes, Random.getBytes(HeaderConst.DefaultKdfSaltLength));
            this.kdfParameters.set('P', VarDictionary.ValueType.UInt32, HeaderConst.DefaultKdfParallelism);
            this.kdfParameters.set('I', VarDictionary.ValueType.UInt64, new Int64(HeaderConst.DefaultKdfIterations));
            this.kdfParameters.set('M', VarDictionary.ValueType.UInt64, new Int64(HeaderConst.DefaultKdfMemory));
            this.kdfParameters.set('V', VarDictionary.ValueType.UInt32, HeaderConst.DefaultKdfVersion);
            break;
        case Consts.KdfId.Aes:
            this.kdfParameters = new VarDictionary();
            this.kdfParameters.set('$UUID', VarDictionary.ValueType.Bytes, ByteUtils.base64ToBytes(Consts.KdfId.Aes));
            this.kdfParameters.set('S', VarDictionary.ValueType.Bytes, Random.getBytes(HeaderConst.DefaultKdfSaltLength));
            this.kdfParameters.set('R', VarDictionary.ValueType.UInt32, Consts.Defaults.KeyEncryptionRounds);
            break;
        default:
            throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'bad KDF algo');
    }
};

/**
 * Saves header to stream
 * @param {BinaryStream} stm
 */
KdbxHeader.prototype.write = function(stm) {
    this._validate();
    this._writeSignature(stm);
    this._writeVersion(stm);
    for (var id = 1; id < HeaderFields.length; id++) {
        this._writeField(stm, id, HeaderFields);
    }
    this._writeField(stm, 0, HeaderFields);
    this.endPos = stm.pos;
};

/**
 * Saves inner header to stream
 * @param {BinaryStream} stm
 * @param {KdbxContext} ctx
 */
KdbxHeader.prototype.writeInnerHeader = function(stm, ctx) {
    this._validateInner();
    for (var id = 1; id < InnerHeaderFields.length; id++) {
        this._writeField(stm, id, InnerHeaderFields, ctx);
    }
    this._writeField(stm, 0, InnerHeaderFields);
};

/**
 * Updates header random salts
 */
KdbxHeader.prototype.generateSalts = function() {
    this.masterSeed = Random.getBytes(32);
    if (this.versionMajor < 4) {
        this.transformSeed = Random.getBytes(32);
        this.streamStartBytes = Random.getBytes(32);
        this.protectedStreamKey = Random.getBytes(32);
        this.encryptionIV = Random.getBytes(16);
    } else {
        this.protectedStreamKey = Random.getBytes(64);
        this.kdfParameters.set('S', VarDictionary.ValueType.Bytes, Random.getBytes(32));
        var ivLength = this.dataCipherUuid.toString() === Consts.CipherId.ChaCha20 ? 12 : 16;
        this.encryptionIV = Random.getBytes(ivLength);
    }
};

/**
 * Upgrade the header to the specified version
 * @param {Number} version - major file version
 */
KdbxHeader.prototype.setVersion = function(version) {
    if (version !== 3 && version !== 4) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'bad file version');
    }
    this.versionMajor = version;
    this.versionMinor = LastMinorVersions[version];
    if (this.versionMajor === 4) {
        if (!this.kdfParameters) {
            this._createKdfParameters();
        }
        this.crsAlgorithm = Consts.CrsAlgorithm.ChaCha20;
        this.keyEncryptionRounds = undefined;
    } else {
        this.kdfParameters = undefined;
        this.crsAlgorithm = Consts.CrsAlgorithm.Salsa20;
        this.keyEncryptionRounds = Consts.Defaults.KeyEncryptionRounds;
    }
};

/**
 * Set file KDF
 * @param kdf - KDF ID, from Consts.KdfId
 */
KdbxHeader.prototype.setKdf = function(kdf) {
    this._createKdfParameters(kdf);
};

/**
 * Read header from stream
 * @param {BinaryStream} stm
 * @param {KdbxContext} ctx
 * @return {KdbxHeader}
 * @static
 */
KdbxHeader.read = function(stm, ctx) {
    var header = new KdbxHeader();
    header._readSignature(stm);
    header._readVersion(stm);
    while (header._readField(stm, HeaderFields, ctx)) {
        continue;
    }
    header.endPos = stm.pos;
    header._validate();
    return header;
};

/**
 * Reads inner header from stream
 * @param {BinaryStream} stm
 * @param {KdbxContext} ctx
 */
KdbxHeader.prototype.readInnerHeader = function(stm, ctx) {
    while (this._readField(stm, InnerHeaderFields, ctx)) {
        continue;
    }
    this._validateInner();
};

/**
 * Creates new header
 * @param {Kdbx} kdbx
 * @return {KdbxHeader}
 * @static
 */
KdbxHeader.create = function() {
    var header = new KdbxHeader();
    header.versionMajor = HeaderConst.DefaultFileVersionMajor;
    header.versionMinor = HeaderConst.DefaultFileVersionMinor;
    header.dataCipherUuid = new KdbxUuid(Consts.CipherId.Aes);
    header.compression = Consts.CompressionAlgorithm.GZip;
    header.keyEncryptionRounds = Consts.Defaults.KeyEncryptionRounds;
    header.crsAlgorithm = Consts.CrsAlgorithm.Salsa20;
    return header;
};

KdbxHeader.MaxFileVersion = HeaderConst.MaxFileVersionMajor;

module.exports = KdbxHeader;


/***/ }),
/* 23 */
/*!***************************!*\
  !*** ./crypto/salsa20.js ***!
  \***************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// code from this gist: https://gist.github.com/dchest/4582374 (no license declared)

function Salsa20(key, nonce) {
    // Constants.
    this.rounds = 20; // number of Salsa rounds
    this.sigmaWords = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

    // State.
    this.keyWords = [];           // key words
    this.nonceWords = [0, 0];     // nonce words
    this.counterWords = [0, 0];   // block counter words

    // Output buffer.
    this.block = [];        // output block of 64 bytes
    this.blockUsed = 64;     // number of block bytes used

    this.setKey(key);
    this.setNonce(nonce);
}

// setKey sets the key to the given 32-byte array.
Salsa20.prototype.setKey = function(key) {
    for (var i = 0, j = 0; i < 8; i++, j += 4) {
        this.keyWords[i] = (key[j] & 0xff)        |
        ((key[j+1] & 0xff)<<8)  |
        ((key[j+2] & 0xff)<<16) |
        ((key[j+3] & 0xff)<<24);
    }
    this._reset();
};

// setNonce sets the nonce to the given 8-byte array.
Salsa20.prototype.setNonce = function(nonce) {
    this.nonceWords[0] = (nonce[0] & 0xff)      |
    ((nonce[1] & 0xff)<<8)  |
    ((nonce[2] & 0xff)<<16) |
    ((nonce[3] & 0xff)<<24);
    this.nonceWords[1] = (nonce[4] & 0xff)      |
    ((nonce[5] & 0xff)<<8)  |
    ((nonce[6] & 0xff)<<16) |
    ((nonce[7] & 0xff)<<24);
    this._reset();
};

// getBytes returns the next numberOfBytes bytes of stream.
Salsa20.prototype.getBytes = function(numberOfBytes) {
    var out = new Uint8Array(numberOfBytes);
    for (var i = 0; i < numberOfBytes; i++) {
        if (this.blockUsed === 64) {
            this._generateBlock();
            this._incrementCounter();
            this.blockUsed = 0;
        }
        out[i] = this.block[this.blockUsed];
        this.blockUsed++;
    }
    return out;
};

Salsa20.prototype.getHexString = function(numberOfBytes) {
    var hex=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
    var out = [];
    var bytes = this.getBytes(numberOfBytes);
    for(var i = 0; i < bytes.length; i++) {
        out.push(hex[(bytes[i] >> 4) & 15]);
        out.push(hex[bytes[i] & 15]);
    }
    return out.join('');
};

// Private methods.

Salsa20.prototype._reset = function() {
    this.counterWords[0] = 0;
    this.counterWords[1] = 0;
    this.blockUsed = 64;
};

// _incrementCounter increments block counter.
Salsa20.prototype._incrementCounter = function() {
    // Note: maximum 2^64 blocks.
    this.counterWords[0] = (this.counterWords[0] + 1) & 0xffffffff;
    if (this.counterWords[0] === 0) {
        this.counterWords[1] = (this.counterWords[1] + 1) & 0xffffffff;
    }
};

// _generateBlock generates 64 bytes from key, nonce, and counter,
// and puts the result into this.block.
Salsa20.prototype._generateBlock = function() {
    var j0 = this.sigmaWords[0],
        j1 = this.keyWords[0],
        j2 = this.keyWords[1],
        j3 = this.keyWords[2],
        j4 = this.keyWords[3],
        j5 = this.sigmaWords[1],
        j6 = this.nonceWords[0],
        j7 = this.nonceWords[1],
        j8 = this.counterWords[0],
        j9 = this.counterWords[1],
        j10 = this.sigmaWords[2],
        j11 = this.keyWords[4],
        j12 = this.keyWords[5],
        j13 = this.keyWords[6],
        j14 = this.keyWords[7],
        j15 = this.sigmaWords[3];

    var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
        x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15;

    var u;

    for (var i = 0; i < this.rounds; i += 2) {
        u = x0 + x12;
        x4 ^= (u<<7) | (u>>>(32-7));
        u = x4 + x0;
        x8 ^= (u<<9) | (u>>>(32-9));
        u = x8 + x4;
        x12 ^= (u<<13) | (u>>>(32-13));
        u = x12 + x8;
        x0 ^= (u<<18) | (u>>>(32-18));

        u = x5 + x1;
        x9 ^= (u<<7) | (u>>>(32-7));
        u = x9 + x5;
        x13 ^= (u<<9) | (u>>>(32-9));
        u = x13 + x9;
        x1 ^= (u<<13) | (u>>>(32-13));
        u = x1 + x13;
        x5 ^= (u<<18) | (u>>>(32-18));

        u = x10 + x6;
        x14 ^= (u<<7) | (u>>>(32-7));
        u = x14 + x10;
        x2 ^= (u<<9) | (u>>>(32-9));
        u = x2 + x14;
        x6 ^= (u<<13) | (u>>>(32-13));
        u = x6 + x2;
        x10 ^= (u<<18) | (u>>>(32-18));

        u = x15 + x11;
        x3 ^= (u<<7) | (u>>>(32-7));
        u = x3 + x15;
        x7 ^= (u<<9) | (u>>>(32-9));
        u = x7 + x3;
        x11 ^= (u<<13) | (u>>>(32-13));
        u = x11 + x7;
        x15 ^= (u<<18) | (u>>>(32-18));

        u = x0 + x3;
        x1 ^= (u<<7) | (u>>>(32-7));
        u = x1 + x0;
        x2 ^= (u<<9) | (u>>>(32-9));
        u = x2 + x1;
        x3 ^= (u<<13) | (u>>>(32-13));
        u = x3 + x2;
        x0 ^= (u<<18) | (u>>>(32-18));

        u = x5 + x4;
        x6 ^= (u<<7) | (u>>>(32-7));
        u = x6 + x5;
        x7 ^= (u<<9) | (u>>>(32-9));
        u = x7 + x6;
        x4 ^= (u<<13) | (u>>>(32-13));
        u = x4 + x7;
        x5 ^= (u<<18) | (u>>>(32-18));

        u = x10 + x9;
        x11 ^= (u<<7) | (u>>>(32-7));
        u = x11 + x10;
        x8 ^= (u<<9) | (u>>>(32-9));
        u = x8 + x11;
        x9 ^= (u<<13) | (u>>>(32-13));
        u = x9 + x8;
        x10 ^= (u<<18) | (u>>>(32-18));

        u = x15 + x14;
        x12 ^= (u<<7) | (u>>>(32-7));
        u = x12 + x15;
        x13 ^= (u<<9) | (u>>>(32-9));
        u = x13 + x12;
        x14 ^= (u<<13) | (u>>>(32-13));
        u = x14 + x13;
        x15 ^= (u<<18) | (u>>>(32-18));
    }

    x0 += j0;
    x1 += j1;
    x2 += j2;
    x3 += j3;
    x4 += j4;
    x5 += j5;
    x6 += j6;
    x7 += j7;
    x8 += j8;
    x9 += j9;
    x10 += j10;
    x11 += j11;
    x12 += j12;
    x13 += j13;
    x14 += j14;
    x15 += j15;

    this.block[ 0] = ( x0 >>>  0) & 0xff; this.block[ 1] = ( x0 >>>  8) & 0xff;
    this.block[ 2] = ( x0 >>> 16) & 0xff; this.block[ 3] = ( x0 >>> 24) & 0xff;
    this.block[ 4] = ( x1 >>>  0) & 0xff; this.block[ 5] = ( x1 >>>  8) & 0xff;
    this.block[ 6] = ( x1 >>> 16) & 0xff; this.block[ 7] = ( x1 >>> 24) & 0xff;
    this.block[ 8] = ( x2 >>>  0) & 0xff; this.block[ 9] = ( x2 >>>  8) & 0xff;
    this.block[10] = ( x2 >>> 16) & 0xff; this.block[11] = ( x2 >>> 24) & 0xff;
    this.block[12] = ( x3 >>>  0) & 0xff; this.block[13] = ( x3 >>>  8) & 0xff;
    this.block[14] = ( x3 >>> 16) & 0xff; this.block[15] = ( x3 >>> 24) & 0xff;
    this.block[16] = ( x4 >>>  0) & 0xff; this.block[17] = ( x4 >>>  8) & 0xff;
    this.block[18] = ( x4 >>> 16) & 0xff; this.block[19] = ( x4 >>> 24) & 0xff;
    this.block[20] = ( x5 >>>  0) & 0xff; this.block[21] = ( x5 >>>  8) & 0xff;
    this.block[22] = ( x5 >>> 16) & 0xff; this.block[23] = ( x5 >>> 24) & 0xff;
    this.block[24] = ( x6 >>>  0) & 0xff; this.block[25] = ( x6 >>>  8) & 0xff;
    this.block[26] = ( x6 >>> 16) & 0xff; this.block[27] = ( x6 >>> 24) & 0xff;
    this.block[28] = ( x7 >>>  0) & 0xff; this.block[29] = ( x7 >>>  8) & 0xff;
    this.block[30] = ( x7 >>> 16) & 0xff; this.block[31] = ( x7 >>> 24) & 0xff;
    this.block[32] = ( x8 >>>  0) & 0xff; this.block[33] = ( x8 >>>  8) & 0xff;
    this.block[34] = ( x8 >>> 16) & 0xff; this.block[35] = ( x8 >>> 24) & 0xff;
    this.block[36] = ( x9 >>>  0) & 0xff; this.block[37] = ( x9 >>>  8) & 0xff;
    this.block[38] = ( x9 >>> 16) & 0xff; this.block[39] = ( x9 >>> 24) & 0xff;
    this.block[40] = (x10 >>>  0) & 0xff; this.block[41] = (x10 >>>  8) & 0xff;
    this.block[42] = (x10 >>> 16) & 0xff; this.block[43] = (x10 >>> 24) & 0xff;
    this.block[44] = (x11 >>>  0) & 0xff; this.block[45] = (x11 >>>  8) & 0xff;
    this.block[46] = (x11 >>> 16) & 0xff; this.block[47] = (x11 >>> 24) & 0xff;
    this.block[48] = (x12 >>>  0) & 0xff; this.block[49] = (x12 >>>  8) & 0xff;
    this.block[50] = (x12 >>> 16) & 0xff; this.block[51] = (x12 >>> 24) & 0xff;
    this.block[52] = (x13 >>>  0) & 0xff; this.block[53] = (x13 >>>  8) & 0xff;
    this.block[54] = (x13 >>> 16) & 0xff; this.block[55] = (x13 >>> 24) & 0xff;
    this.block[56] = (x14 >>>  0) & 0xff; this.block[57] = (x14 >>>  8) & 0xff;
    this.block[58] = (x14 >>> 16) & 0xff; this.block[59] = (x14 >>> 24) & 0xff;
    this.block[60] = (x15 >>>  0) & 0xff; this.block[61] = (x15 >>>  8) & 0xff;
    this.block[62] = (x15 >>> 16) & 0xff; this.block[63] = (x15 >>> 24) & 0xff;
};

module.exports = Salsa20;


/***/ }),
/* 24 */
/*!****************************!*\
  !*** ./crypto/chacha20.js ***!
  \****************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function ChaCha20(key, nonce) {
    this.sigmaWords = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
    this.block = new Uint8Array(64);
    this.blockUsed = 64;
    this.x = new Uint32Array(16);

    var input = new Uint32Array(16);

    input[0] = this.sigmaWords[0];
    input[1] = this.sigmaWords[1];
    input[2] = this.sigmaWords[2];
    input[3] = this.sigmaWords[3];
    input[4] = u8to32le(key, 0);
    input[5] = u8to32le(key, 4);
    input[6] = u8to32le(key, 8);
    input[7] = u8to32le(key, 12);
    input[8] = u8to32le(key, 16);
    input[9] = u8to32le(key, 20);
    input[10] = u8to32le(key, 24);
    input[11] = u8to32le(key, 28);
    input[12] = 0; // counter

    if (nonce.length === 12) {
        input[13] = u8to32le(nonce, 0);
        input[14] = u8to32le(nonce, 4);
        input[15] = u8to32le(nonce, 8);
    } else {
        input[13] = 0;
        input[14] = u8to32le(nonce, 0);
        input[15] = u8to32le(nonce, 4);
    }

    this.input = input;
}

ChaCha20.prototype.getBytes = function(numberOfBytes) {
    var out = new Uint8Array(numberOfBytes);
    for (var i = 0; i < numberOfBytes; i++) {
        if (this.blockUsed === 64) {
            this._generateBlock();
            this.blockUsed = 0;
        }
        out[i] = this.block[this.blockUsed];
        this.blockUsed++;
    }
    return out;
};

ChaCha20.prototype._generateBlock = function() {
    var input = this.input;
    var x = this.x;
    var block = this.block;
    var i;

    x.set(input);
    for (i = 20; i > 0; i -= 2) {
        quarterRound(x, 0, 4, 8, 12);
        quarterRound(x, 1, 5, 9, 13);
        quarterRound(x, 2, 6, 10, 14);
        quarterRound(x, 3, 7, 11, 15);
        quarterRound(x, 0, 5, 10, 15);
        quarterRound(x, 1, 6, 11, 12);
        quarterRound(x, 2, 7, 8, 13);
        quarterRound(x, 3, 4, 9, 14);
    }
    for (i = 16; i--;) {
        x[i] += input[i];
    }
    for (i = 16; i--;) {
        u32to8le(block, 4 * i, x[i]);
    }

    input[12] += 1;
    if (!input[12]) {
        input[13] += 1;
    }
};

ChaCha20.prototype.encrypt = function(data) {
    var length = data.length;
    var res = new Uint8Array(length);
    var pos = 0;
    var block = this.block;
    while (pos < length) {
        this._generateBlock();
        var blockLength = Math.min(length - pos, 64);
        for (var i = 0; i < blockLength; i++) {
            res[pos] = data[pos] ^ block[i];
            pos++;
        }
    }
    return res;
};

function quarterRound(x, a, b, c, d) {
    x[a] += x[b];
    x[d] = rotate(x[d] ^ x[a], 16);
    x[c] += x[d];
    x[b] = rotate(x[b] ^ x[c], 12);
    x[a] += x[b];
    x[d] = rotate(x[d] ^ x[a], 8);
    x[c] += x[d];
    x[b] = rotate(x[b] ^ x[c], 7);
}

function u8to32le(x, i) {
    return x[i] | (x[i + 1] << 8) | (x[i + 2] << 16) | (x[i + 3] << 24);
}

function u32to8le(x, i, u) {
    x[i] = u;
    u >>>= 8;
    x[i + 1] = u;
    u >>>= 8;
    x[i + 2] = u;
    u >>>= 8;
    x[i + 3] = u;
}

function rotate(v, c) {
    return (v << c) | (v >>> (32 - c));
}

module.exports = ChaCha20;


/***/ }),
/* 25 */
/*!*************************************!*\
  !*** ./crypto/key-encryptor-aes.js ***!
  \*************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ByteUtils = __webpack_require__(/*! ./../utils/byte-utils */ 0),
    CryptoEngine = __webpack_require__(/*! ./crypto-engine */ 3);

var maxRoundsPreIteration = 10000;
var aesBlockSize = 16;
var credentialSize = 32;

/*
In order to simulate multiple rounds of ECB encryption, we do CBC encryption
across a zero buffer of large length with the IV being the desired plaintext.
The zero buffer does not contribute to the xor, so xoring the previous block
with the next one simulates running ECB multiple times. We limit the maximum
size of the zero buffer to prevent enormous memory usage.
*/

function encrypt(credentials, key, rounds) {
    var algo = CryptoEngine.createAesCbc();
    return algo.importKey(ByteUtils.arrayToBuffer(key))
        .then(function() {
            var resolvers = [];
            for (var idx = 0; idx < credentialSize; idx += aesBlockSize) {
                resolvers.push(encryptBlock(algo,
                    credentials.subarray(idx, idx + aesBlockSize), rounds));
            }
            return Promise.all(resolvers);
        })
        .then(function(results) {
            var res = new Uint8Array(credentialSize);
            results.forEach(function (result, idx) {
                var base = idx * aesBlockSize;
                for (var i = 0; i < aesBlockSize; ++i) {
                    res[i + base] = result[i];
                }
                ByteUtils.zeroBuffer(result);
            });
            return res;
        });
}

function encryptBlock(algo, iv, rounds) {
    var result = Promise.resolve(ByteUtils.arrayToBuffer(iv));
    var buffer = new Uint8Array(aesBlockSize * Math.min(rounds, maxRoundsPreIteration));

    while (rounds > 0) {
        var currentRounds = Math.min(rounds, maxRoundsPreIteration);
        rounds -= currentRounds;

        var dataLen = aesBlockSize * currentRounds;
        var zeroData = buffer.length === dataLen ? buffer.buffer : ByteUtils.arrayToBuffer(buffer.subarray(0, dataLen));
        result = encryptBlockBuffer(algo, result, zeroData);
    }

    return result.then(function(res) { return new Uint8Array(res); });
}

function encryptBlockBuffer(algo, promisedIv, buffer) {
    return promisedIv
        .then(function(iv) {
            return algo.encrypt(buffer, iv);
        })
        .then(function(buf) {
            var res = ByteUtils.arrayToBuffer(new Uint8Array(buf).subarray(-2 * aesBlockSize, -aesBlockSize));
            ByteUtils.zeroBuffer(buf);
            return res;
        });
}

module.exports.encrypt = encrypt;


/***/ }),
/* 26 */
/*!************************************!*\
  !*** ./format/kdbx-credentials.js ***!
  \************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ProtectedValue = __webpack_require__(/*! ../crypto/protected-value */ 9),
    KdbxError = __webpack_require__(/*! ../errors/kdbx-error */ 2),
    Consts = __webpack_require__(/*! ../defs/consts */ 1),
    ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0),
    XmlUtils = __webpack_require__(/*! ../utils/xml-utils */ 4),
    Random = __webpack_require__(/*! ../crypto/random */ 10),
    CryptoEngine = __webpack_require__(/*! ../crypto/crypto-engine */ 3);

/**
 * Credentials
 * @param {ProtectedValue} password
 * @param {String|ArrayBuffer|Uint8Array} [keyFile]
 * @constructor
 */
var KdbxCredentials = function(password, keyFile, challengeResponse) {
    var that = this;
    this.ready = Promise.all([
        this.setPassword(password),
        this.setKeyFile(keyFile),
        this.setChallengeResponse(challengeResponse)
    ]).then(function() {
        return that;
    });
};

/**
 * Set password
 * @param {ProtectedValue|null} password
 */
KdbxCredentials.prototype.setPassword = function(password) {
    if (password === null) {
        this.passwordHash = null;
    } else if (!(password instanceof ProtectedValue)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'password'));
    } else {
        var that = this;
        return password.getHash().then(function(hash) {
            that.passwordHash = ProtectedValue.fromBinary(hash);
        });
    }
    return Promise.resolve();
};

/**
 * Set keyfile
 * @param {ArrayBuffer|Uint8Array} [keyFile]
 */
KdbxCredentials.prototype.setKeyFile = function(keyFile) {
    if (keyFile && !(keyFile instanceof ArrayBuffer) && !(keyFile instanceof Uint8Array)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'keyFile'));
    }
    if (keyFile) {
        if (keyFile.byteLength === 32) {
            this.keyFileHash = ProtectedValue.fromBinary(ByteUtils.arrayToBuffer(keyFile));
            return Promise.resolve();
        }
        try {
            var keyFileStr;
            keyFileStr = ByteUtils.bytesToString(ByteUtils.arrayToBuffer(keyFile));
            if (keyFileStr.match(/^[a-f\d]{64}$/i)) {
                var bytes = ByteUtils.hexToBytes(keyFileStr);
                this.keyFileHash = ProtectedValue.fromBinary(bytes);
                return;
            }
            var xml = XmlUtils.parse(keyFileStr.trim());
            var keyEl = XmlUtils.getChildNode(xml.documentElement, 'Key');
            var dataEl = XmlUtils.getChildNode(keyEl, 'Data');
            this.keyFileHash = ProtectedValue.fromBinary(ByteUtils.base64ToBytes(dataEl.textContent));
        } catch (e) {
            var that = this;
            return CryptoEngine.sha256(keyFile).then(function(hash) {
                that.keyFileHash = ProtectedValue.fromBinary(hash);
            });
        }
    } else {
        this.keyFileHash = null;
    }
    return Promise.resolve();
};

/**
 * Set a challenge-response module
 * @param challengeResponse {Function}
 */
KdbxCredentials.prototype.setChallengeResponse = function(challengeResponse) {
    this.challengeResponse = challengeResponse;
    return Promise.resolve();
};

/**
 * Get credentials hash
 * @returns {Promise.<ArrayBuffer>}
 */
KdbxCredentials.prototype.getHash = function(challenge) {
    var that = this;
    return this.ready.then(function() {
        return that.getChallengeResponse(challenge).then(function(chalResp) {
            var buffers = [];
            if (that.passwordHash) {
                buffers.push(that.passwordHash.getBinary());
            }
            if (that.keyFileHash) {
                buffers.push(that.keyFileHash.getBinary());
            }
            if (chalResp) {
                buffers.push(new Uint8Array(chalResp));
            }
            var totalLength = buffers.reduce(function(acc, buf) {
                return acc + buf.byteLength;
            }, 0);
            var allBytes = new Uint8Array(totalLength);
            var offset = 0;
            buffers.forEach(function(buffer) {
                allBytes.set(buffer, offset);
                ByteUtils.zeroBuffer(buffer);
                offset += buffer.length;
            });
            return CryptoEngine.sha256(ByteUtils.arrayToBuffer(allBytes)).then(function(hash) {
                ByteUtils.zeroBuffer(allBytes);
                return hash;
            });
        });
    });
};

KdbxCredentials.prototype.getChallengeResponse = function(challenge) {
    var challengeResponse = this.challengeResponse;
    return Promise.resolve()
        .then(function() {
            if (!challengeResponse || !challenge) {
                return null;
            }
            return challengeResponse(challenge).then(function(response) {
                return CryptoEngine.sha256(ByteUtils.arrayToBuffer(response)).then(function (hash) {
                    ByteUtils.zeroBuffer(response);
                    return hash;
                });
            });
        });
};

/**
 * Creates random keyfile
 * @returns {Uint8Array}
 */
KdbxCredentials.createRandomKeyFile = function() {
    var keyLength = 32;
    var keyBytes = Random.getBytes(keyLength),
        salt = Random.getBytes(keyLength);
    for (var i = 0; i < keyLength; i++) {
        keyBytes[i] ^= salt[i];
        keyBytes[i] ^= (Math.random() * 1000 % 255);
    }
    var key = ByteUtils.bytesToBase64(keyBytes);
    return KdbxCredentials.createKeyFileWithHash(key);
};

/**
 * Creates keyfile by given hash
 * @param {string} hash base64-encoded hash
 * @returns {Uint8Array}
 */
KdbxCredentials.createKeyFileWithHash = function(hash) {
    var xml = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<KeyFile>\n' +
        '    <Meta>\n' +
        '        <Version>1.00</Version>\n' +
        '    </Meta>\n' +
        '    <Key>\n' +
        '       <Data>' + hash + '</Data>\n' +
        '   </Key>\n' +
        '</KeyFile>';
    return ByteUtils.stringToBytes(xml);
};

module.exports = KdbxCredentials;


/***/ }),
/* 27 */
/*!******************************!*\
  !*** ./format/kdbx-times.js ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var XmlNames = __webpack_require__(/*! ./../defs/xml-names */ 6),
    XmlUtils = __webpack_require__(/*! ./../utils/xml-utils */ 4);

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
    this.locationChanged = new Date();
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
 * Clones object
 * @returns {KdbxTimes}
 */
KdbxTimes.prototype.clone = function() {
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

KdbxTimes.prototype.update = function() {
    var now = new Date();
    this.lastModTime = now;
    this.lastAccessTime = now;
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxTimes.prototype.write = function(parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Times);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.CreationTime), this.creationTime);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LastModTime), this.lastModTime);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LastAccessTime), this.lastAccessTime);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.ExpiryTime), this.expiryTime);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.Expires), this.expires);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.UsageCount), this.usageCount);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LocationChanged), this.locationChanged);
};

/**
 * Creates new times
 * @return {KdbxTimes}
 */
KdbxTimes.create = function() {
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


/***/ }),
/* 28 */
/*!******************************!*\
  !*** ./format/kdbx-entry.js ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ProtectedValue = __webpack_require__(/*! ../crypto/protected-value */ 9),
    XmlNames = __webpack_require__(/*! ./../defs/xml-names */ 6),
    XmlUtils = __webpack_require__(/*! ./../utils/xml-utils */ 4),
    Consts = __webpack_require__(/*! ../defs/consts */ 1),
    KdbxCustomData = __webpack_require__(/*! ./kdbx-custom-data */ 15),
    KdbxUuid = __webpack_require__(/*! ./kdbx-uuid */ 7),
    KdbxTimes = __webpack_require__(/*! ./kdbx-times */ 27);

var tagsSplitRegex = /\s*[;,:]\s*/;

/**
 * Entry
 * @constructor
 */
var KdbxEntry = function() {
    this.uuid = undefined;
    this.icon = undefined;
    this.customIcon = undefined;
    this.fgColor = undefined;
    this.bgColor = undefined;
    this.overrideUrl = undefined;
    this.tags = [];
    this.times = new KdbxTimes();
    this.fields = {};
    this.binaries = {};
    this.autoType = {
        enabled: true, obfuscation: Consts.AutoTypeObfuscationOptions.None, defaultSequence: undefined, items: []
    };
    this.history = [];
    this.parentGroup = undefined;
    this.customData = undefined;
    this._editState = undefined;
    Object.preventExtensions(this);
};

KdbxEntry.prototype._readNode = function(node, ctx) {
    switch (node.tagName) {
        case XmlNames.Elem.Uuid:
            this.uuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Icon:
            this.icon = XmlUtils.getNumber(node) || Consts.Icons.Key;
            break;
        case XmlNames.Elem.CustomIconID:
            this.customIcon = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.FgColor:
            this.fgColor = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.BgColor:
            this.bgColor = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.OverrideUrl:
            this.overrideUrl = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.Tags:
            this.tags = this._stringToTags(XmlUtils.getText(node));
            break;
        case XmlNames.Elem.Times:
            this.times = KdbxTimes.read(node);
            break;
        case XmlNames.Elem.String:
            this._readField(node);
            break;
        case XmlNames.Elem.Binary:
            this._readBinary(node, ctx);
            break;
        case XmlNames.Elem.AutoType:
            this._readAutoType(node);
            break;
        case XmlNames.Elem.History:
            this._readHistory(node, ctx);
            break;
        case XmlNames.Elem.CustomData:
            this._readCustomData(node);
            break;
    }
};

KdbxEntry.prototype._readField = function(node) {
    var keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key),
        valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value),
        key = XmlUtils.getText(keyNode),
        value = XmlUtils.getProtectedText(valueNode);
    if (key) {
        this.fields[key] = value;
    }
};

KdbxEntry.prototype._writeFields = function(parentNode) {
    var fields = this.fields;
    Object.keys(fields).forEach(function(field) {
        var value = fields[field];
        if (value !== undefined && value !== null) {
            var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.String);
            XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), field);
            XmlUtils.setProtectedText(XmlUtils.addChildNode(node, XmlNames.Elem.Value), value);
        }
    });
};

KdbxEntry.prototype._readBinary = function(node, ctx) {
    var keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key),
        valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value),
        key = XmlUtils.getText(keyNode),
        value = XmlUtils.getProtectedBinary(valueNode);
    if (key && value) {
        if (value.ref) {
            value.ref = ctx.kdbx.binaries.idToHash[value.ref];
            if (value.ref) {
                value.value = ctx.kdbx.binaries[value.ref];
            } else {
                value = null;
            }
        }
        if (value) {
            this.binaries[key] = value;
        }
    }
};

KdbxEntry.prototype._writeBinaries = function(parentNode, ctx) {
    var binaries = this.binaries;
    Object.keys(binaries).forEach(function(id) {
        var data = binaries[id];
        if (data) {
            if (data.ref) {
                var index = ctx.kdbx.binaries.hashOrder.indexOf(data.ref);
                if (index < 0) {
                    return;
                }
                data = { ref: index.toString() };
            }
            var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binary);
            XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), id);
            XmlUtils.setProtectedBinary(XmlUtils.addChildNode(node, XmlNames.Elem.Value), data);
        }
    });
};

KdbxEntry.prototype._stringToTags = function(str) {
    if (!str) {
        return [];
    }
    return str.split(tagsSplitRegex).filter(function(s) { return s; });
};

KdbxEntry.prototype._readAutoType = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.AutoTypeEnabled:
                this.autoType.enabled = XmlUtils.getBoolean(childNode);
                if (typeof this.autoType.enabled !== 'boolean') {
                    this.autoType.enabled = true;
                }
                break;
            case XmlNames.Elem.AutoTypeObfuscation:
                this.autoType.obfuscation = XmlUtils.getNumber(childNode) || Consts.AutoTypeObfuscationOptions.None;
                break;
            case XmlNames.Elem.AutoTypeDefaultSeq:
                this.autoType.defaultSequence = XmlUtils.getText(childNode);
                break;
            case XmlNames.Elem.AutoTypeItem:
                this._readAutoTypeItem(childNode);
                break;
        }
    }
};

KdbxEntry.prototype._readAutoTypeItem = function(node) {
    var item = {};
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Window:
                item.window = XmlUtils.getText(childNode);
                break;
            case XmlNames.Elem.KeystrokeSequence:
                item.keystrokeSequence = XmlUtils.getText(childNode);
                break;
        }
    }
    this.autoType.items.push(item);
};

KdbxEntry.prototype._writeAutoType = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.AutoType);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeEnabled), this.autoType.enabled);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeObfuscation),
        this.autoType.obfuscation || Consts.AutoTypeObfuscationOptions.None);
    if (this.autoType.defaultSequence) {
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeDefaultSeq), this.autoType.defaultSequence);
    }
    for (var i = 0; i < this.autoType.items.length; i++) {
        var item = this.autoType.items[i];
        var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeItem);
        XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Window), item.window);
        XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.KeystrokeSequence), item.keystrokeSequence);
    }
};

KdbxEntry.prototype._readHistory = function(node, ctx) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Entry:
                this.history.push(KdbxEntry.read(childNode, ctx));
                break;
        }
    }
};

KdbxEntry.prototype._writeHistory = function(parentNode, ctx) {
    var historyNode = XmlUtils.addChildNode(parentNode, XmlNames.Elem.History);
    for (var i = 0; i < this.history.length; i++) {
        this.history[i].write(historyNode, ctx);
    }
};

KdbxEntry.prototype._readCustomData = function(node) {
    this.customData = KdbxCustomData.read(node);
};

KdbxEntry.prototype._writeCustomData = function(parentNode) {
    KdbxCustomData.write(parentNode, this.customData);
};

KdbxEntry.prototype._setField = function(name, str, secure) {
    this.fields[name] = secure ? ProtectedValue.fromString(str) : str;
};

KdbxEntry.prototype._addHistoryTombstone = function(isAdded, dt) {
    if (!this._editState) {
        this._editState = { added: [], deleted: [] };
    }
    this._editState[isAdded ? 'added' : 'deleted'].push(dt.getTime());
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxEntry.prototype.write = function(parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Entry);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.Icon), this.icon || Consts.Icons.Key);
    if (this.customIcon) {
        XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
    }
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.FgColor), this.fgColor);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.BgColor), this.bgColor);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.OverrideUrl), this.overrideUrl);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Tags), this.tags.join(','));
    this.times.write(node, ctx);
    this._writeFields(node);
    this._writeBinaries(node, ctx);
    this._writeAutoType(node);
    this._writeCustomData(node);
    if (parentNode.tagName !== XmlNames.Elem.History) {
        this._writeHistory(node, ctx);
    }
};

/**
 * Push current entry state to the top of history
 */
KdbxEntry.prototype.pushHistory = function() {
    var historyEntry = new KdbxEntry();
    historyEntry.copyFrom(this);
    this.history.push(historyEntry);
    this._addHistoryTombstone(true, historyEntry.times.lastModTime);
};

/**
 * Remove some entry history states at index
 * @param {number} index - history state start index
 * @param {number} [count=1] - deleted states count
 */
KdbxEntry.prototype.removeHistory = function(index, count) {
    if (count === undefined) {
        count = 1;
    }
    for (var ix = index; ix < index + count; ix++) {
        if (ix < this.history.length) {
            this._addHistoryTombstone(false, this.history[ix].times.lastModTime);
        }
    }
    this.history.splice(index, count);
};

/**
 * Clone entry state from another entry, or history entry
 */
KdbxEntry.prototype.copyFrom = function(entry) {
    this.uuid = entry.uuid;
    this.icon = entry.icon;
    this.customIcon = entry.customIcon;
    this.fgColor = entry.fgColor;
    this.bgColor = entry.bgColor;
    this.overrideUrl = entry.overrideUrl;
    this.tags = entry.tags.slice();
    this.times = entry.times.clone();
    this.fields = {};
    Object.keys(entry.fields).forEach(function(name) {
        if (entry.fields[name] instanceof ProtectedValue) {
            this.fields[name] = entry.fields[name].clone();
        } else {
            this.fields[name] = entry.fields[name];
        }
    }, this);
    this.binaries = {};
    Object.keys(entry.binaries).forEach(function(name) {
        if (entry.binaries[name] instanceof ProtectedValue) {
            this.binaries[name] = entry.binaries[name].clone();
        } else if (entry.binaries[name] && entry.binaries[name].ref) {
            this.binaries[name] = { ref: entry.binaries[name].ref };
            if (entry.binaries[name].value) {
                this.binaries[name].value = entry.binaries[name].value;
            }
        } else {
            this.binaries[name] = entry.binaries[name];
        }
    }, this);
    this.autoType = JSON.parse(JSON.stringify(entry.autoType));
};

/**
 * Merge entry with remote entry
 * @param {{objects, remote, deleted}} objectMap
 */
KdbxEntry.prototype.merge = function(objectMap) {
    var remoteEntry = objectMap.remote[this.uuid];
    if (!remoteEntry) {
        return;
    }
    var remoteHistory = remoteEntry.history.slice();
    if (this.times.lastModTime < remoteEntry.times.lastModTime) {
        // remote is more new; push current state to history and update
        this.pushHistory();
        this.copyFrom(remoteEntry);
    } else if (this.times.lastModTime > remoteEntry.times.lastModTime) {
        // local is more new; if remote state is not in history, push it
        var existsInHistory = this.history.some(function(historyEntry) {
            return +historyEntry.times.lastModTime === +remoteEntry.times.lastModTime;
        });
        if (!existsInHistory) {
            var historyEntry = new KdbxEntry();
            historyEntry.copyFrom(remoteEntry);
            remoteHistory.push(historyEntry);
        }
    }
    this.history = this._mergeHistory(remoteHistory, remoteEntry.times.lastModTime);
};

/**
 * Merge entry history with remote entry history
 * Tombstones are stored locally and must be immediately discarded by replica after successful upstream push.
 * It's client responsibility, to save and load tombstones for local replica, and to clear them after successful upstream push.
 *
 * Implements remove-win OR-set CRDT with local tombstones stored in _editState.
 *
 * Format doesn't allow saving tombstones for history entries, so they are stored locally.
 * Any unmodified state from past or modifications of current state synced with central upstream will be successfully merged.
 * Assumes there's only one central upstream, may produce inconsistencies while merging outdated replica outside main upstream.
 * Phantom entries and phantom deletions will appear if remote replica checked out an old state and has just added a new state.
 * If a client is using central upstream for sync, the remote replica must first sync it state and
 * only after it update the upstream, so this should never happen.
 *
 * References:
 *
 * An Optimized Conflict-free Replicated Set arXiv:1210.3368 [cs.DC]
 * http://arxiv.org/abs/1210.3368
 *
 * Gene T. J. Wuu and Arthur J. Bernstein. Efficient solutions to the replicated log and dictionary
 * problems. In Symp. on Principles of Dist. Comp. (PODC), pages 233–242, Vancouver, BC, Canada, August 1984.
 * https://pages.lip6.fr/Marc.Shapiro/papers/RR-7687.pdf
 *
 * @param {KdbxEntry[]} remoteHistory - history records from remote entry
 * @param {Date} remoteLastModTime - last mod time for remote entry
 * @returns {KdbxEntry[]} - new history
 * @private
 */
KdbxEntry.prototype._mergeHistory = function(remoteHistory, remoteLastModTime) {
    // we can skip sorting but the history may not have been sorted
    this.history.sort(function(x, y) { return x.times.lastModTime - y.times.lastModTime; });
    remoteHistory.sort(function(x, y) { return x.times.lastModTime - y.times.lastModTime; });
    var historyMap = {}, remoteHistoryMap = {};
    this.history.forEach(function(record) { historyMap[record.times.lastModTime.getTime()] = record; });
    remoteHistory.forEach(function(record) { remoteHistoryMap[record.times.lastModTime.getTime()] = record; });
    var historyIx = 0, remoteHistoryIx = 0;
    var newHistory = [];
    while (historyIx < this.history.length || remoteHistoryIx < remoteHistory.length) {
        var historyEntry = this.history[historyIx],
            remoteHistoryEntry = remoteHistory[remoteHistoryIx],
            entryTime = historyEntry && historyEntry.times.lastModTime.getTime(),
            remoteEntryTime = remoteHistoryEntry && remoteHistoryEntry.times.lastModTime.getTime();
        if (entryTime === remoteEntryTime) {
            // exists in local and remote
            newHistory.push(historyEntry);
            historyIx++;
            remoteHistoryIx++;
            continue;
        }
        if (!historyEntry || entryTime > remoteEntryTime) {
            // local is absent
            if (!this._editState || this._editState.deleted.indexOf(remoteEntryTime) < 0) {
                // added remotely
                var remoteHistoryEntryClone = new KdbxEntry();
                remoteHistoryEntryClone.copyFrom(remoteHistoryEntry);
                newHistory.push(remoteHistoryEntryClone);
            } // else: deleted locally
            remoteHistoryIx++;
            continue;
        }
        // (!remoteHistoryEntry || entryTime < remoteEntryTime) && historyEntry
        // remote is absent
        if (this._editState && this._editState.added.indexOf(entryTime) >= 0) {
            // added locally
            newHistory.push(historyEntry);
        } else if (entryTime > remoteLastModTime) {
            // outdated replica history has ended
            newHistory.push(historyEntry);
        } // else: deleted remotely
        historyIx++;
    }
    return newHistory;
};

/**
 * Creates new entry
 * @param {KdbxMeta} meta - db metadata
 * @param {KdbxGroup} parentGroup - parent group
 * @returns {KdbxEntry}
 */
KdbxEntry.create = function(meta, parentGroup) {
    var entry = new KdbxEntry(parentGroup);
    entry.uuid = KdbxUuid.random();
    entry.icon = Consts.Icons.Key;
    entry.times = KdbxTimes.create();
    entry.parentGroup = parentGroup;
    entry._setField('Title', '', meta.memoryProtection.title);
    entry._setField('UserName', meta.defaultUser || '', meta.memoryProtection.userName);
    entry._setField('Password', '', meta.memoryProtection.password);
    entry._setField('URL', '', meta.memoryProtection.url);
    entry._setField('Notes', '', meta.memoryProtection.notes);
    entry.autoType.enabled = typeof parentGroup.enableAutoType === 'boolean' ? parentGroup.enableAutoType : true;
    entry.autoType.obfuscation = Consts.AutoTypeObfuscationOptions.None;
    return entry;
};

/**
 * Read entry from xml
 * @param {Node} xmlNode
 * @param {KdbxContext} ctx
 * @param {KdbxGroup} [parentGroup]
 * @return {KdbxEntry}
 */
KdbxEntry.read = function(xmlNode, ctx, parentGroup) {
    var entry = new KdbxEntry();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            entry._readNode(childNode, ctx);
        }
    }
    if (!entry.uuid) {
        // some clients don't write ids
        entry.uuid = KdbxUuid.random();
        for (var j = 0; j < entry.history.length; j++) {
            entry.history[j].uuid = entry.uuid;
        }
    }
    entry.parentGroup = parentGroup;
    return entry;
};

module.exports = KdbxEntry;


/***/ }),
/* 29 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

module.exports.Kdbx = __webpack_require__(/*! ./format/kdbx */ 30);
module.exports.KdbxUuid = __webpack_require__(/*! ./format/kdbx-uuid */ 7);
module.exports.KdbxError = __webpack_require__(/*! ./errors/kdbx-error */ 2);
module.exports.Credentials = __webpack_require__(/*! ./format/kdbx-credentials */ 26);
module.exports.Consts = __webpack_require__(/*! ./defs/consts */ 1);
module.exports.ProtectedValue = __webpack_require__(/*! ./crypto/protected-value */ 9);
module.exports.ByteUtils = __webpack_require__(/*! ./utils/byte-utils */ 0);
module.exports.VarDictionary = __webpack_require__(/*! ./utils/var-dictionary */ 14);
module.exports.Int64 = __webpack_require__(/*! ./utils/int64 */ 8);
module.exports.Random = __webpack_require__(/*! ./crypto/random */ 10);
module.exports.CryptoEngine = __webpack_require__(/*! ./crypto/crypto-engine */ 3);


/***/ }),
/* 30 */
/*!************************!*\
  !*** ./format/kdbx.js ***!
  \************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var
    KdbxFormat = __webpack_require__(/*! ./kdbx-format */ 31),
    KdbxError = __webpack_require__(/*! ./../errors/kdbx-error */ 2),
    KdbxCredentials = __webpack_require__(/*! ./kdbx-credentials */ 26),
    KdbxHeader = __webpack_require__(/*! ./kdbx-header */ 22),
    KdbxMeta = __webpack_require__(/*! ./kdbx-meta */ 49),
    KdbxBinaries = __webpack_require__(/*! ./kdbx-binaries */ 50),
    KdbxGroup = __webpack_require__(/*! ./kdbx-group */ 51),
    KdbxEntry = __webpack_require__(/*! ./kdbx-entry */ 28),
    KdbxDeletedObject = __webpack_require__(/*! ./kdbx-deleted-object */ 52),
    KdbxUuid = __webpack_require__(/*! ./kdbx-uuid */ 7),
    Consts = __webpack_require__(/*! ./../defs/consts */ 1),
    XmlNames = __webpack_require__(/*! ./../defs/xml-names */ 6),
    XmlUtils = __webpack_require__(/*! ./../utils/xml-utils */ 4);

/**
 * Kdbx file (KeePass database v2)
 * @constructor
 */
var Kdbx = function() {
    this.header = undefined;
    this.credentials = undefined;
    this.meta = undefined;
    this.xml = undefined;
    this.binaries = new KdbxBinaries();
    this.groups = [];
    this.deletedObjects = [];
    Object.preventExtensions(this);
};

/**
 * Creates new database
 * @return {Kdbx}
 */
Kdbx.create = function(credentials, name) {
    if (!(credentials instanceof KdbxCredentials)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials');
    }
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    kdbx.header = KdbxHeader.create();
    kdbx.meta = KdbxMeta.create();
    kdbx.meta._name = name;
    kdbx.createDefaultGroup();
    kdbx.createRecycleBin();
    kdbx.meta._lastSelectedGroup = kdbx.getDefaultGroup().id;
    kdbx.meta._lastTopVisibleGroup = kdbx.getDefaultGroup().id;
    return kdbx;
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @param {KdbxCredentials} credentials
 * @return {Promise.<Kdbx>}
 */
Kdbx.load = function(data, credentials) {
    if (!(data instanceof ArrayBuffer)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'data'));
    }
    if (!(credentials instanceof KdbxCredentials)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials'));
    }
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    var format = new KdbxFormat(kdbx);
    return format.load(data);
};

/**
 * Import database from xml file
 * If there was an error loading xml file, throws an exception
 * @param {String} data - xml file contents
 * @param {KdbxCredentials} credentials
 * @return {Promise.<Kdbx>}
 */
Kdbx.loadXml = function(data, credentials) {
    if ((typeof data !== 'string')) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'data'));
    }
    if (!(credentials instanceof KdbxCredentials)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.InvalidArg, 'credentials'));
    }
    var kdbx = new Kdbx();
    kdbx.credentials = credentials;
    var format = new KdbxFormat(kdbx);
    return format.loadXml(data);
};

/**
 * Save db to ArrayBuffer
 * @return {Promise.<ArrayBuffer>}
 */
Kdbx.prototype.save = function() {
    var format = new KdbxFormat(this);
    return format.save();
};

/**
 * Save db to XML
 * @param {boolean} [prettyPrint=false] - pretty print XML
 * @return {Promise.<String>}
 */
Kdbx.prototype.saveXml = function(prettyPrint) {
    var format = new KdbxFormat(this);
    return format.saveXml(prettyPrint);
};

/**
 * Creates default group, if it's not yet created
 */
Kdbx.prototype.createDefaultGroup = function() {
    if (this.groups.length) {
        return;
    }
    var defaultGroup = KdbxGroup.create(this.meta.name);
    defaultGroup.icon = Consts.Icons.FolderOpen;
    defaultGroup.expanded = true;
    this.groups.push(defaultGroup);
};

/**
 * Creates recycle bin, if it's not yet created
 */
Kdbx.prototype.createRecycleBin = function() {
    this.meta.recycleBinEnabled = true;
    if (this.meta.recycleBinUuid && this.getGroup(this.meta.recycleBinUuid)) {
        return;
    }
    var defGrp = this.getDefaultGroup();
    var recycleBin = KdbxGroup.create(Consts.Defaults.RecycleBinName, defGrp);
    recycleBin.icon = Consts.Icons.TrashBin;
    recycleBin.enableAutoType = false;
    recycleBin.enableSearching = false;
    this.meta.recycleBinUuid = recycleBin.uuid;
    defGrp.groups.push(recycleBin);
};

/**
 * Adds new group to group
 * @param {string} name - new group name
 * @param {KdbxGroup} group - parent group
 * @return {KdbxGroup}
 */
Kdbx.prototype.createGroup = function(group, name) {
    var subGroup = KdbxGroup.create(name, group);
    group.groups.push(subGroup);
    return subGroup;
};

/**
 * Adds new entry to group
 * @param {KdbxGroup} group - parent group
 * @return {KdbxEntry}
 */
Kdbx.prototype.createEntry = function(group) {
    var entry = KdbxEntry.create(this.meta, group);
    group.entries.push(entry);
    return entry;
};

/**
 * Gets default group
 * @return {KdbxGroup}
 */
Kdbx.prototype.getDefaultGroup = function() {
    return this.groups[0];
};

/**
 * Get group by uuid
 * @param {KdbxUuid|string} uuid
 * @param {KdbxGroup} [parentGroup]
 * @return {KdbxGroup|undefined}
 */
Kdbx.prototype.getGroup = function(uuid, parentGroup) {
    var groups = parentGroup ? parentGroup.groups : this.groups;
    for (var i = 0; i < groups.length; i++) {
        if (groups[i].uuid.id === uuid.id) {
            return groups[i];
        }
        var res = this.getGroup(uuid, groups[i]);
        if (res) {
            return res;
        }
    }
};

/**
 * Move object from one group to another
 * @param {KdbxEntry|KdbxGroup} object - object to be moved
 * @param {KdbxGroup} toGroup - target parent group
 * @param {Number} [atIndex] - index in target group (by default, insert to the end of the group)
 */
Kdbx.prototype.move = function(object, toGroup, atIndex) {
    var containerProp = object instanceof KdbxGroup ? 'groups' : 'entries';
    var fromContainer = object.parentGroup[containerProp];
    var ix = fromContainer.indexOf(object);
    if (ix < 0) {
        return;
    }
    fromContainer.splice(ix, 1);
    if (toGroup) {
        if (typeof atIndex === 'number' && atIndex >= 0) {
            toGroup[containerProp].splice(atIndex, 0, object);
        } else {
            toGroup[containerProp].push(object);
        }
    } else {
        var now = new Date();
        if (object instanceof KdbxGroup) {
            object.forEach(function (group, entry) {
                this.addDeletedObject((group || entry).uuid, now);
            }, this);
        } else {
            this.addDeletedObject(object.uuid, now);
        }
    }
    object.parentGroup = toGroup;
    object.times.locationChanged = new Date();
};

/**
 * Adds deleted object
 * @param {KdbxUuid} uuid - object uuid
 * @param {Date} dt - deletion date
 */
Kdbx.prototype.addDeletedObject = function(uuid, dt) {
    var deletedObject = new KdbxDeletedObject();
    deletedObject.uuid = uuid;
    deletedObject.deletionTime = dt;
    this.deletedObjects.push(deletedObject);
};

/**
 * Delete entry or group
 * Depending on settings, removes either to trash, or completely
 * @param {KdbxEntry|KdbxGroup} object - object to be deleted
 */
Kdbx.prototype.remove = function(object) {
    var toGroup = null;
    if (this.meta.recycleBinEnabled) {
        this.createRecycleBin();
        toGroup = this.getGroup(this.meta.recycleBinUuid);
    }
    this.move(object, toGroup);
};

/**
 * Creates a binary in the db and returns a reference to it
 * @param {ProtectedValue|ArrayBuffer} value
 * @return {Promise}
 */
Kdbx.prototype.createBinary = function(value) {
    return this.binaries.add(value);
};

/**
 * Import entry from another file
 * It's up to caller to decide what should happen to the original entry in the source file
 * @param {KdbxEntry} entry - entry to be imported
 * @param {KdbxGroup} group - target parent group
 * @param {Kdbx} file - the source file containing the group
 */
Kdbx.prototype.importEntry = function(entry, group, file) {
    var newEntry = new KdbxEntry();
    var uuid = KdbxUuid.random();

    newEntry.copyFrom(entry);
    newEntry.uuid = uuid;
    entry.history.forEach(function(historyEntry) {
        var newHistoryEntry = new KdbxEntry();
        newHistoryEntry.copyFrom(historyEntry);
        newHistoryEntry.uuid = uuid;
        newEntry.history.push(newHistoryEntry);
    });

    var binaries = {};
    var customIcons = {};
    newEntry.history.concat(newEntry).forEach(function(e) {
        if (e.customIcon) {
            customIcons[e.customIcon] = e.customIcon;
        }
        Object.values(e.binaries).forEach(function(binary) {
            if (binary.ref) {
                binaries[binary.ref] = binary;
            }
        });
    });

    Object.values(binaries).forEach(function(binary) {
        var fileBinary = file.binaries[binary.ref];
        if (fileBinary && !this.binaries[binary.ref]) {
            this.binaries[binary.ref] = fileBinary;
        }
    }, this);

    Object.values(customIcons).forEach(function(customIconId) {
        var customIcon = file.meta.customIcons[customIconId];
        if (customIcon) {
            this.meta.customIcons[customIconId] = customIcon;
        }
    }, this);

    group.entries.push(newEntry);

    newEntry.parentGroup = group;
    newEntry.times.update();

    return newEntry;
};

/**
 * Perform database cleanup
 * @param {object} settings - cleanup settings
 * @param {boolean} [settings.historyRules=false] - remove extra history, it it doesn't match defined rules, e.g. records number
 * @param {boolean} [settings.customIcons=false] - remove unused custom icons
 * @param {boolean} [settings.binaries=false] - remove unused binaries
 */
Kdbx.prototype.cleanup = function(settings) {
    var now = new Date();
    var historyMaxItems = settings && settings.historyRules &&
        typeof this.meta.historyMaxItems === 'number' &&
        this.meta.historyMaxItems >= 0 ?
            this.meta.historyMaxItems : Infinity;
    var usedCustomIcons = {};
    var usedBinaries = {};
    var processEntry = function(entry) {
        if (entry && entry.customIcon) {
            usedCustomIcons[entry.customIcon] = true;
        }
        if (entry && entry.binaries) {
            Object.keys(entry.binaries).forEach(function(key) {
                if (entry.binaries[key] && entry.binaries[key].ref) {
                    usedBinaries[entry.binaries[key].ref] = true;
                }
            });
        }
    };
    this.getDefaultGroup().forEach(function (entry, group) {
        if (entry && entry.history.length > historyMaxItems) {
            entry.removeHistory(0, entry.history.length - historyMaxItems);
        }
        if (entry) {
            processEntry(entry);
        }
        if (entry && entry.history) {
            entry.history.forEach(function(historyEntry) {
                processEntry(historyEntry);
            });
        }
        if (group && group.customIcon) {
            usedCustomIcons[group.customIcon] = true;
        }
    });
    if (settings && settings.customIcons) {
        Object.keys(this.meta.customIcons).forEach(function(customIcon) {
            if (!usedCustomIcons[customIcon]) {
                var uuid = new KdbxUuid(customIcon);
                this.addDeletedObject(uuid, now);
                delete this.meta.customIcons[customIcon];
            }
        }, this);
    }
    if (settings && settings.binaries) {
        Object.keys(this.binaries).forEach(function(bin) {
            if (!usedBinaries[bin]) {
                delete this.binaries[bin];
            }
        }, this);
    }
};

/**
 * Merge db with another db
 * Some parts of remote DB are copied by reference, so it should NOT be modified after merge
 * Suggested use case:
 * - open local db
 * - get remote db somehow and open in
 * - merge remote into local: local.merge(remote)
 * - close remote db
 * @param {Kdbx} remote - database to merge in
 */
Kdbx.prototype.merge = function(remote) {
    var root = this.getDefaultGroup();
    var remoteRoot = remote.getDefaultGroup();
    if (!root || !remoteRoot) {
        throw new KdbxError(Consts.ErrorCodes.MergeError, 'no default group');
    }
    if (!root.uuid.equals(remoteRoot.uuid)) {
        throw new KdbxError(Consts.ErrorCodes.MergeError, 'default group is different');
    }
    var objectMap = this._getObjectMap();
    remote.deletedObjects.forEach(function(rem) {
        if (!objectMap.deleted[rem.uuid]) {
            this.deletedObjects.push(rem);
            objectMap.deleted[rem.uuid] = rem.deletionTime;
        }
    }, this);
    Object.keys(remote.binaries).forEach(function(key) {
        if (!this.binaries[key] && !objectMap.deleted[key]) {
            this.binaries[key] = remote.binaries[key];
        }
    }, this);
    objectMap.remote = remote._getObjectMap().objects;
    this.meta.merge(remote.meta, objectMap);
    root.merge(objectMap);
    this.cleanup({ historyRules: true, customIcons: true, binaries: true });
};

/**
 * Gets editing state tombstones (for successful merge)
 * Replica must save this state with the db, assign in on db open and call removeLocalEditState on successful upstream push
 * This state is JSON serializable
 */
Kdbx.prototype.getLocalEditState = function() {
    var editingState = {};
    this.getDefaultGroup().forEach(function(entry) {
        if (entry && entry._editState) {
            editingState[entry.uuid] = entry._editState;
        }
    });
    if (this.meta._editState) {
        editingState.meta = this.meta._editState;
    }
    return editingState;
};

/**
 * Sets editing state tombstones returned previously by getLocalEditState
 * Replica must call this method on db open with state returned previously on getLocalEditState
 * @param editingState - result of getLocalEditState invoked before db save
 */
Kdbx.prototype.setLocalEditState = function(editingState) {
    this.getDefaultGroup().forEach(function(entry) {
        if (entry && editingState[entry.uuid]) {
            entry._editState = editingState[entry.uuid];
        }
    });
    if (editingState.meta) {
        this.meta._editState = editingState.meta;
    }
};

/**
 * Removes editing state tombstones
 * Immediately after successful upstream push replica must:
 * - call this method
 * - discard previous state obtained by getLocalEditState call
 */
Kdbx.prototype.removeLocalEditState = function() {
    this.getDefaultGroup().forEach(function(entry) {
        if (entry) {
            entry._editState = undefined;
        }
    });
    this.meta._editState = undefined;
};

/**
 * Upgrade the file to latest version
 */
Kdbx.prototype.upgrade = function() {
    this.setVersion(KdbxHeader.MaxFileVersion);
};

/**
 * Set file version to a specified number
 * @param {Number} version - 3 or 4
 */
Kdbx.prototype.setVersion = function(version) {
    this.meta.headerHash = null;
    this.meta.settingsChanged = new Date();
    this.header.setVersion(version);
};

/**
 * Set file key derivation function
 * @param {String} kdf - KDF id, from Consts.KdfId
 */
Kdbx.prototype.setKdf = function(kdf) {
    this.meta.headerHash = null;
    this.meta.settingsChanged = new Date();
    this.header.setKdf(kdf);
};

Kdbx.prototype._getObjectMap = function() {
    var objects = {}, deleted = {};
    this.getDefaultGroup().forEach(function(entry, group) {
        var object = entry || group;
        if (objects[object.uuid]) {
            throw new KdbxError(Consts.ErrorCodes.MergeError, 'Duplicate: ' + object.uuid);
        }
        objects[object.uuid] = object;
    });
    this.deletedObjects.forEach(function(deletedObject) {
        deleted[deletedObject.uuid] = deletedObject.deletionTime;
    });
    return { objects: objects, deleted: deleted };
};

Kdbx.prototype._loadFromXml = function(ctx) {
    var doc = this.xml.documentElement;
    if (doc.tagName !== XmlNames.Elem.DocNode) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad xml root');
    }
    this._parseMeta(ctx);
    var that = this;
    return this.binaries.hash().then(function() {
        that._parseRoot(ctx);
        return that;
    });
};

Kdbx.prototype._parseMeta = function(ctx) {
    var node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Meta, 'no meta node');
    this.meta = KdbxMeta.read(node, ctx);
};

Kdbx.prototype._parseRoot = function(ctx) {
    this.groups = [];
    this.deletedObjects = [];
    var node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Root, 'no root node');
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.Group:
                this._readGroup(childNode, ctx);
                break;
            case XmlNames.Elem.DeletedObjects:
                this._readDeletedObjects(childNode);
                break;
        }
    }
};

Kdbx.prototype._readDeletedObjects = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.DeletedObject:
                this.deletedObjects.push(KdbxDeletedObject.read(childNode));
                break;
        }
    }
};

Kdbx.prototype._readGroup = function(node, ctx) {
    this.groups.push(KdbxGroup.read(node, ctx));
};

Kdbx.prototype._buildXml = function(ctx) {
    var xml = XmlUtils.create(XmlNames.Elem.DocNode);
    this.meta.write(xml.documentElement, ctx);
    var rootNode = XmlUtils.addChildNode(xml.documentElement, XmlNames.Elem.Root);
    this.groups.forEach(function(g) { g.write(rootNode, ctx); }, this);
    var delObjNode = XmlUtils.addChildNode(rootNode, XmlNames.Elem.DeletedObjects);
    this.deletedObjects.forEach(function (d) { d.write(delObjNode, ctx); }, this);
    this.xml = xml;
};

module.exports = Kdbx;


/***/ }),
/* 31 */
/*!*******************************!*\
  !*** ./format/kdbx-format.js ***!
  \*******************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var pako = __webpack_require__(/*! pako */ 16),

    KdbxError = __webpack_require__(/*! ../errors/kdbx-error */ 2),
    KdbxHeader = __webpack_require__(/*! ./kdbx-header */ 22),
    KdbxContext = __webpack_require__(/*! ./kdbx-context */ 43),

    CryptoEngine = __webpack_require__(/*! ../crypto/crypto-engine */ 3),
    BinaryStream = __webpack_require__(/*! ../utils/binary-stream */ 11),
    ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0),
    XmlUtils = __webpack_require__(/*! ../utils/xml-utils */ 4),
    Int64 = __webpack_require__(/*! ../utils/int64 */ 8),
    Consts = __webpack_require__(/*! ../defs/consts */ 1),
    HashedBlockTransform = __webpack_require__(/*! ../crypto/hashed-block-transform */ 45),
    HmacBlockTransform = __webpack_require__(/*! ../crypto/hmac-block-transform */ 46),
    ProtectSaltGenerator = __webpack_require__(/*! ../crypto/protect-salt-generator */ 47),
    KeyEncryptorAes = __webpack_require__(/*! ../crypto/key-encryptor-aes */ 25),
    KeyEncryptorKdf = __webpack_require__(/*! ../crypto/key-encryptor-kdf */ 48);

var KdbxFormat = function(kdbx) {
    this.kdbx = kdbx;
};

/**
 * Load kdbx file
 * If there was an error loading file, throws an exception
 * @param {ArrayBuffer} data - database file contents
 * @returns {Promise.<Kdbx>}
 */
KdbxFormat.prototype.load = function(data) {
    var stm = new BinaryStream(data);
    var kdbx = this.kdbx;
    var that = this;
    that.ctx = new KdbxContext({ kdbx: kdbx });
    return kdbx.credentials.ready.then(function() {
        kdbx.header = KdbxHeader.read(stm, that.ctx);
        if (kdbx.header.versionMajor === 3) {
            return that._loadV3(stm);
        } else if (kdbx.header.versionMajor === 4) {
            return that._loadV4(stm);
        } else {
            throw new KdbxError(Consts.ErrorCodes.InvalidVersion, 'bad version: ' + kdbx.header.versionMajor);
        }
    });
};

KdbxFormat.prototype._loadV3 = function(stm) {
    var kdbx = this.kdbx;
    var that = this;
    return that._decryptXmlV3(kdbx, stm).then(function(xmlStr) {
        kdbx.xml = XmlUtils.parse(xmlStr);
        return that._setProtectedValues().then(function() {
            return kdbx._loadFromXml(that.ctx).then(function() {
                return that._checkHeaderHashV3(stm).then(function () {
                    return kdbx;
                });
            });
        });
    });
};

KdbxFormat.prototype._loadV4 = function(stm) {
    var that = this;
    return that._getHeaderHash(stm).then(function(headerSha) {
        var expectedHeaderSha = stm.readBytes(headerSha.byteLength);
        if (!ByteUtils.arrayBufferEquals(expectedHeaderSha, headerSha)) {
            throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'header hash mismatch');
        }
        return that._computeKeysV4().then(function(keys) {
            return that._getHeaderHmac(stm, keys.hmacKey).then(function(headerHmac) {
                var expectedHeaderHmac = stm.readBytes(headerHmac.byteLength);
                if (!ByteUtils.arrayBufferEquals(expectedHeaderHmac, headerHmac)) {
                    throw new KdbxError(Consts.ErrorCodes.InvalidKey);
                }
                return HmacBlockTransform.decrypt(stm.readBytesToEnd(), keys.hmacKey).then(function(data) {
                    ByteUtils.zeroBuffer(keys.hmacKey);
                    return that._decryptData(data, keys.cipherKey).then(function(data) {
                        ByteUtils.zeroBuffer(keys.cipherKey);
                        if (that.kdbx.header.compression === Consts.CompressionAlgorithm.GZip) {
                            data = pako.ungzip(data);
                        }
                        stm = new BinaryStream(ByteUtils.arrayToBuffer(data));
                        that.kdbx.header.readInnerHeader(stm, that.ctx);
                        data = stm.readBytesToEnd();
                        var xmlStr = ByteUtils.bytesToString(data);
                        that.kdbx.xml = XmlUtils.parse(xmlStr);
                        return that._setProtectedValues().then(function() {
                            return that.kdbx._loadFromXml(that.ctx);
                        });
                    });
                });
            });
        });
    });
};

/**
 * Load XML file
 * @param {string} xmlStr
 * @returns {Promise.<Kdbx>}
 */
KdbxFormat.prototype.loadXml = function(xmlStr) {
    var kdbx = this.kdbx;
    var ctx = new KdbxContext({ kdbx: kdbx });
    return kdbx.credentials.ready.then(function() {
        kdbx.header = KdbxHeader.create();
        kdbx.xml = XmlUtils.parse(xmlStr);
        XmlUtils.protectPlainValues(kdbx.xml.documentElement);
        return kdbx._loadFromXml(ctx);
    });
};

/**
 * Save kdbx file
 * @returns {Promise.<ArrayBuffer>}
 */
KdbxFormat.prototype.save = function() {
    var kdbx = this.kdbx;
    var that = this;
    that.ctx = new KdbxContext({ kdbx: kdbx });
    kdbx.binaries.assignIds();
    return kdbx.credentials.ready.then(function() {
        var stm = new BinaryStream();
        kdbx.header.generateSalts();
        kdbx.header.write(stm);
        if (kdbx.header.versionMajor === 3) {
            return that._saveV3(stm);
        } else if (kdbx.header.versionMajor === 4) {
            return that._saveV4(stm);
        } else {
            throw new KdbxError(Consts.ErrorCodes.InvalidVersion, 'bad version: ' + kdbx.header.versionMajor);
        }
    });
};

KdbxFormat.prototype._saveV3 = function(stm) {
    var that = this;
    return that._getHeaderHash(stm).then(function(headerHash) {
        that.kdbx.meta.headerHash = headerHash;
        that.kdbx._buildXml(that.ctx);
        return that._getProtectSaltGenerator().then(function(gen) {
            XmlUtils.updateProtectedValuesSalt(that.kdbx.xml.documentElement, gen);
            return that._encryptXmlV3().then(function(data) {
                stm.writeBytes(data);
                return stm.getWrittenBytes();
            });
        });
    });
};

KdbxFormat.prototype._saveV4 = function(stm) {
    var that = this;
    that.kdbx._buildXml(that.ctx);
    return that._getHeaderHash(stm).then(function(headerSha) {
        stm.writeBytes(headerSha);
        return that._computeKeysV4().then(function(keys) {
            return that._getHeaderHmac(stm, keys.hmacKey).then(function(headerHmac) {
                stm.writeBytes(headerHmac);
                return that._getProtectSaltGenerator().then(function(gen) {
                    XmlUtils.updateProtectedValuesSalt(that.kdbx.xml.documentElement, gen);
                    var xml = XmlUtils.serialize(that.kdbx.xml);
                    var innerHeaderStm = new BinaryStream();
                    that.kdbx.header.writeInnerHeader(innerHeaderStm, that.ctx);
                    var innerHeaderData = innerHeaderStm.getWrittenBytes();
                    var xmlData = ByteUtils.arrayToBuffer(ByteUtils.stringToBytes(xml));
                    var data = new ArrayBuffer(innerHeaderData.byteLength + xmlData.byteLength);
                    var dataArr = new Uint8Array(data);
                    dataArr.set(new Uint8Array(innerHeaderData));
                    dataArr.set(new Uint8Array(xmlData), innerHeaderData.byteLength);
                    ByteUtils.zeroBuffer(xmlData);
                    ByteUtils.zeroBuffer(innerHeaderData);
                    if (that.kdbx.header.compression === Consts.CompressionAlgorithm.GZip) {
                        data = pako.gzip(data);
                    }
                    return that._encryptData(ByteUtils.arrayToBuffer(data), keys.cipherKey).then(function(data) {
                        ByteUtils.zeroBuffer(keys.cipherKey);
                        return HmacBlockTransform.encrypt(data, keys.hmacKey).then(function(data) {
                            ByteUtils.zeroBuffer(keys.hmacKey);
                            stm.writeBytes(data);
                            return stm.getWrittenBytes();
                        });
                    });
                });
            });
        });
    });
};

KdbxFormat.prototype.saveXml = function(prettyPrint) {
    var kdbx = this.kdbx;
    return kdbx.credentials.ready.then(function() {
        kdbx.header.generateSalts();
        var ctx = new KdbxContext({ kdbx: kdbx, exportXml: true });
        kdbx.binaries.assignIds();
        kdbx._buildXml(ctx);
        XmlUtils.unprotectValues(kdbx.xml.documentElement);
        var xml = XmlUtils.serialize(kdbx.xml, prettyPrint);
        XmlUtils.protectUnprotectedValues(kdbx.xml.documentElement);
        return xml;
    });
};

KdbxFormat.prototype._decryptXmlV3 = function(kdbx, stm) {
    var data = stm.readBytesToEnd();
    var that = this;
    return that._getMasterKeyV3().then(function(masterKey) {
        return that._decryptData(data, masterKey).then(function(data) {
            ByteUtils.zeroBuffer(masterKey);
            data = that._trimStartBytesV3(data);
            return HashedBlockTransform.decrypt(data).then(function(data) {
                if (that.kdbx.header.compression === Consts.CompressionAlgorithm.GZip) {
                    data = pako.ungzip(data);
                }
                return ByteUtils.bytesToString(data);
            });
        });
    });
};

KdbxFormat.prototype._encryptXmlV3 = function() {
    var kdbx = this.kdbx;
    var that = this;
    var xml = XmlUtils.serialize(kdbx.xml);
    var data = ByteUtils.arrayToBuffer(ByteUtils.stringToBytes(xml));
    if (kdbx.header.compression === Consts.CompressionAlgorithm.GZip) {
        data = pako.gzip(data);
    }
    return HashedBlockTransform.encrypt(ByteUtils.arrayToBuffer(data)).then(function(data) {
        var ssb = new Uint8Array(kdbx.header.streamStartBytes);
        var newData = new Uint8Array(data.byteLength + ssb.length);
        newData.set(ssb);
        newData.set(new Uint8Array(data), ssb.length);
        data = newData;
        return that._getMasterKeyV3().then(function(masterKey) {
            return that._encryptData(ByteUtils.arrayToBuffer(data), masterKey).then(function(data) {
                ByteUtils.zeroBuffer(masterKey);
                return data;
            });
        });
    });
};

KdbxFormat.prototype._getMasterKeyV3 = function() {
    var kdbx = this.kdbx;
    return kdbx.credentials.getHash().then(function(credHash) {
        var transformSeed = kdbx.header.transformSeed;
        var transformRounds = kdbx.header.keyEncryptionRounds;
        var masterSeed = kdbx.header.masterSeed;

        return kdbx.credentials.getChallengeResponse(masterSeed).then(function(chalResp)  {
            return KeyEncryptorAes.encrypt(new Uint8Array(credHash), transformSeed, transformRounds).then(function(encKey) {
                ByteUtils.zeroBuffer(credHash);
                return CryptoEngine.sha256(encKey).then(function(keyHash) {
                    ByteUtils.zeroBuffer(encKey);

                    var chalRespLength = chalResp ? chalResp.byteLength : 0;
                    var all = new Uint8Array(masterSeed.byteLength + keyHash.byteLength + chalRespLength);
                    all.set(new Uint8Array(masterSeed), 0);
                    if (chalResp) {
                        all.set(new Uint8Array(chalResp), masterSeed.byteLength);
                    }
                    all.set(new Uint8Array(keyHash), masterSeed.byteLength + chalRespLength);

                    ByteUtils.zeroBuffer(keyHash);
                    ByteUtils.zeroBuffer(masterSeed);
                    if (chalResp) {
                        ByteUtils.zeroBuffer(chalResp);
                    }

                    return CryptoEngine.sha256(all.buffer).then(function(masterKey) {
                        ByteUtils.zeroBuffer(all.buffer);
                        return masterKey;
                    });
                });
            });
        });
    });
};

KdbxFormat.prototype._trimStartBytesV3 = function(data) {
    var ssb = this.kdbx.header.streamStartBytes;
    if (data.byteLength < ssb.byteLength) {
        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'short start bytes');
    }
    if (!ByteUtils.arrayBufferEquals(data.slice(0, this.kdbx.header.streamStartBytes.byteLength), ssb)) {
        throw new KdbxError(Consts.ErrorCodes.InvalidKey);
    }
    return data.slice(ssb.byteLength);
};

KdbxFormat.prototype._setProtectedValues = function() {
    var kdbx = this.kdbx;
    return this._getProtectSaltGenerator().then(function(gen) {
        XmlUtils.setProtectedValues(kdbx.xml.documentElement, gen);
    });
};

KdbxFormat.prototype._getProtectSaltGenerator = function() {
    return ProtectSaltGenerator.create(this.kdbx.header.protectedStreamKey, this.kdbx.header.crsAlgorithm);
};

KdbxFormat.prototype._getHeaderHash = function(stm) {
    var src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
    return CryptoEngine.sha256(src);
};

KdbxFormat.prototype._getHeaderHmac = function(stm, key) {
    var src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
    return HmacBlockTransform.getHmacKey(key, new Int64(0xffffffff, 0xffffffff)).then(function(keySha) {
        return CryptoEngine.hmacSha256(keySha, src);
    });
};

KdbxFormat.prototype._checkHeaderHashV3 = function(stm) {
    if (this.kdbx.meta.headerHash) {
        var metaHash = this.kdbx.meta.headerHash;
        return this._getHeaderHash(stm).then(function(actualHash) {
            if (!ByteUtils.arrayBufferEquals(metaHash, actualHash)) {
                throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'header hash mismatch');
            }
        });
    } else {
        return Promise.resolve();
    }
};

KdbxFormat.prototype._computeKeysV4 = function() {
    var that = this;
    var masterSeed = that.kdbx.header.masterSeed;
    if (!masterSeed || masterSeed.byteLength !== 32) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad master seed'));
    }
    var kdfParams = that.kdbx.header.kdfParameters;
    var kdfSalt = kdfParams.get('S');
    return that.kdbx.credentials.getHash(kdfSalt).then(function(credHash) {
        return KeyEncryptorKdf.encrypt(credHash, kdfParams).then(function (encKey) {
            ByteUtils.zeroBuffer(credHash);
            if (!encKey || encKey.byteLength !== 32) {
                return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'bad derived key'));
            }
            var keyWithSeed = new Uint8Array(65);
            keyWithSeed.set(new Uint8Array(masterSeed), 0);
            keyWithSeed.set(new Uint8Array(encKey), masterSeed.byteLength);
            keyWithSeed[64] = 1;
            ByteUtils.zeroBuffer(encKey);
            ByteUtils.zeroBuffer(masterSeed);
            return Promise.all([
                CryptoEngine.sha256(keyWithSeed.buffer.slice(0, 64)),
                CryptoEngine.sha512(keyWithSeed.buffer)
            ]).then(function (keys) {
                ByteUtils.zeroBuffer(keyWithSeed);
                return { cipherKey: keys[0], hmacKey: keys[1] };
            });
        });
    });
};

KdbxFormat.prototype._decryptData = function(data, cipherKey) {
    var cipherId = this.kdbx.header.dataCipherUuid;
    switch (cipherId.toString()) {
        case Consts.CipherId.Aes:
            return this._transformDataV4Aes(data, cipherKey, false);
        case Consts.CipherId.ChaCha20:
            return this._transformDataV4ChaCha20(data, cipherKey);
        default:
            return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'unsupported cipher'));
    }
};

KdbxFormat.prototype._encryptData = function(data, cipherKey) {
    var cipherId = this.kdbx.header.dataCipherUuid;
    switch (cipherId.toString()) {
        case Consts.CipherId.Aes:
            return this._transformDataV4Aes(data, cipherKey, true);
        case Consts.CipherId.ChaCha20:
            return this._transformDataV4ChaCha20(data, cipherKey);
        default:
            return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'unsupported cipher'));
    }
};

KdbxFormat.prototype._transformDataV4Aes = function(data, cipherKey, encrypt) {
    var that = this;
    var aesCbc = CryptoEngine.createAesCbc();
    return aesCbc.importKey(cipherKey).then(function() {
        return encrypt ?
            aesCbc.encrypt(data, that.kdbx.header.encryptionIV) :
            aesCbc.decrypt(data, that.kdbx.header.encryptionIV);
    });
};

KdbxFormat.prototype._transformDataV4ChaCha20 = function(data, cipherKey) {
    return CryptoEngine.chacha20(data, cipherKey, this.kdbx.header.encryptionIV);
};

module.exports = KdbxFormat;


/***/ }),
/* 32 */
/*!*******************************************!*\
  !*** ../node_modules/pako/lib/deflate.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var zlib_deflate = __webpack_require__(/*! ./zlib/deflate */ 33);
var utils        = __webpack_require__(/*! ./utils/common */ 5);
var strings      = __webpack_require__(/*! ./utils/strings */ 19);
var msg          = __webpack_require__(/*! ./zlib/messages */ 12);
var ZStream      = __webpack_require__(/*! ./zlib/zstream */ 20);

var toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

var Z_NO_FLUSH      = 0;
var Z_FINISH        = 4;

var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_SYNC_FLUSH    = 2;

var Z_DEFAULT_COMPRESSION = -1;

var Z_DEFAULT_STRATEGY    = 0;

var Z_DEFLATED  = 8;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overriden.
 **/

/**
 * Deflate.result -> Uint8Array|Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param)  or if you
 * push a chunk with explicit flush (call [[Deflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate(options) {
  if (!(this instanceof Deflate)) return new Deflate(options);

  this.options = utils.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY,
    to: ''
  }, options || {});

  var opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new ZStream();
  this.strm.avail_out = 0;

  var status = zlib_deflate.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK) {
    throw new Error(msg[status]);
  }

  if (opt.header) {
    zlib_deflate.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    var dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = zlib_deflate.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK) {
      throw new Error(msg[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Deflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the compression context.
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * array format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;

  if (this.ended) { return false; }

  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = zlib_deflate.deflate(strm, _mode);    /* no bad return value */

    if (status !== Z_STREAM_END && status !== Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }
    if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {
      if (this.options.to === 'string') {
        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
      } else {
        this.onData(utils.shrinkBuf(strm.output, strm.next_out));
      }
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

  // Finalize on the last chunk.
  if (_mode === Z_FINISH) {
    status = zlib_deflate.deflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === Z_SYNC_FLUSH) {
    this.onEnd(Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate(input, options) {
  var deflator = new Deflate(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate(input, options);
}


exports.Deflate = Deflate;
exports.deflate = deflate;
exports.deflateRaw = deflateRaw;
exports.gzip = gzip;


/***/ }),
/* 33 */
/*!************************************************!*\
  !*** ../node_modules/pako/lib/zlib/deflate.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils   = __webpack_require__(/*! ../utils/common */ 5);
var trees   = __webpack_require__(/*! ./trees */ 34);
var adler32 = __webpack_require__(/*! ./adler32 */ 17);
var crc32   = __webpack_require__(/*! ./crc32 */ 18);
var msg     = __webpack_require__(/*! ./messages */ 12);

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS      = 256;
/* number of literal bytes 0..255 */
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES       = 30;
/* number of distance codes */
var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
var MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only(s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);
  this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
function deflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var s;
  var str, n;
  var wrap;
  var avail;
  var next;
  var input;
  var tmpDict;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  s = strm.state;
  wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    tmpDict = new utils.Buf8(s.w_size);
    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  avail = strm.avail_in;
  next = strm.next_in;
  input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    str = s.strstart;
    n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK;
}


exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/


/***/ }),
/* 34 */
/*!**********************************************!*\
  !*** ../node_modules/pako/lib/zlib/trees.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var utils = __webpack_require__(/*! ../utils/common */ 5);

/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES + 2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


var static_l_desc;
var static_d_desc;
var static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short(s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n * 2;
  var _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize - 1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;


/***/ }),
/* 35 */
/*!*******************************************!*\
  !*** ../node_modules/pako/lib/inflate.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var zlib_inflate = __webpack_require__(/*! ./zlib/inflate */ 36);
var utils        = __webpack_require__(/*! ./utils/common */ 5);
var strings      = __webpack_require__(/*! ./utils/strings */ 19);
var c            = __webpack_require__(/*! ./zlib/constants */ 21);
var msg          = __webpack_require__(/*! ./zlib/messages */ 12);
var ZStream      = __webpack_require__(/*! ./zlib/zstream */ 20);
var GZheader     = __webpack_require__(/*! ./zlib/gzheader */ 39);

var toString = Object.prototype.toString;

/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overriden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
 * push a chunk with explicit flush (call [[Inflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate(options) {
  if (!(this instanceof Inflate)) return new Inflate(options);

  this.options = utils.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new ZStream();
  this.strm.avail_out = 0;

  var status  = zlib_inflate.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== c.Z_OK) {
    throw new Error(msg[status]);
  }

  this.header = new GZheader();

  zlib_inflate.inflateGetHeader(this.strm, this.header);
}

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the decompression context.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var dictionary = this.options.dictionary;
  var status, _mode;
  var next_out_utf8, tail, utf8str;
  var dict;

  // Flag to properly process Z_BUF_ERROR on testing inflate call
  // when we check that all output data was flushed.
  var allowBufError = false;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */

    if (status === c.Z_NEED_DICT && dictionary) {
      // Convert data if needed
      if (typeof dictionary === 'string') {
        dict = strings.string2buf(dictionary);
      } else if (toString.call(dictionary) === '[object ArrayBuffer]') {
        dict = new Uint8Array(dictionary);
      } else {
        dict = dictionary;
      }

      status = zlib_inflate.inflateSetDictionary(this.strm, dict);

    }

    if (status === c.Z_BUF_ERROR && allowBufError === true) {
      status = c.Z_OK;
      allowBufError = false;
    }

    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }

    // When no more input data, we should check that internal inflate buffers
    // are flushed. The only way to do it when avail_out = 0 - run one more
    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
    // Here we set flag to process this error properly.
    //
    // NOTE. Deflate does not return error in this case and does not needs such
    // logic.
    if (strm.avail_in === 0 && strm.avail_out === 0) {
      allowBufError = true;
    }

  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);

  if (status === c.Z_STREAM_END) {
    _mode = c.Z_FINISH;
  }

  // Finalize on the last chunk.
  if (_mode === c.Z_FINISH) {
    status = zlib_inflate.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === c.Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === c.Z_SYNC_FLUSH) {
    this.onEnd(c.Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === c.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 alligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip  = inflate;


/***/ }),
/* 36 */
/*!************************************************!*\
  !*** ../node_modules/pako/lib/zlib/inflate.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var utils         = __webpack_require__(/*! ../utils/common */ 5);
var adler32       = __webpack_require__(/*! ./adler32 */ 17);
var crc32         = __webpack_require__(/*! ./crc32 */ 18);
var inflate_fast  = __webpack_require__(/*! ./inffast */ 37);
var inflate_table = __webpack_require__(/*! ./inftrees */ 38);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function zswap32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
    case HEAD:
      if (state.wrap === 0) {
        state.mode = TYPEDO;
        break;
      }
      //=== NEEDBITS(16);
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
        state.check = 0/*crc32(0L, Z_NULL, 0)*/;
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//

        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = FLAGS;
        break;
      }
      state.flags = 0;           /* expect zlib header */
      if (state.head) {
        state.head.done = false;
      }
      if (!(state.wrap & 1) ||   /* check if zlib header allowed */
        (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
        strm.msg = 'incorrect header check';
        state.mode = BAD;
        break;
      }
      if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
      len = (hold & 0x0f)/*BITS(4)*/ + 8;
      if (state.wbits === 0) {
        state.wbits = len;
      }
      else if (len > state.wbits) {
        strm.msg = 'invalid window size';
        state.mode = BAD;
        break;
      }
      state.dmax = 1 << len;
      //Tracev((stderr, "inflate:   zlib header ok\n"));
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = hold & 0x200 ? DICTID : TYPE;
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      break;
    case FLAGS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.flags = hold;
      if ((state.flags & 0xff) !== Z_DEFLATED) {
        strm.msg = 'unknown compression method';
        state.mode = BAD;
        break;
      }
      if (state.flags & 0xe000) {
        strm.msg = 'unknown header flags set';
        state.mode = BAD;
        break;
      }
      if (state.head) {
        state.head.text = ((hold >> 8) & 1);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = TIME;
      /* falls through */
    case TIME:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.time = hold;
      }
      if (state.flags & 0x0200) {
        //=== CRC4(state.check, hold)
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        hbuf[2] = (hold >>> 16) & 0xff;
        hbuf[3] = (hold >>> 24) & 0xff;
        state.check = crc32(state.check, hbuf, 4, 0);
        //===
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = OS;
      /* falls through */
    case OS:
      //=== NEEDBITS(16); */
      while (bits < 16) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if (state.head) {
        state.head.xflags = (hold & 0xff);
        state.head.os = (hold >> 8);
      }
      if (state.flags & 0x0200) {
        //=== CRC2(state.check, hold);
        hbuf[0] = hold & 0xff;
        hbuf[1] = (hold >>> 8) & 0xff;
        state.check = crc32(state.check, hbuf, 2, 0);
        //===//
      }
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = EXLEN;
      /* falls through */
    case EXLEN:
      if (state.flags & 0x0400) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length = hold;
        if (state.head) {
          state.head.extra_len = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      else if (state.head) {
        state.head.extra = null/*Z_NULL*/;
      }
      state.mode = EXTRA;
      /* falls through */
    case EXTRA:
      if (state.flags & 0x0400) {
        copy = state.length;
        if (copy > have) { copy = have; }
        if (copy) {
          if (state.head) {
            len = state.head.extra_len - state.length;
            if (!state.head.extra) {
              // Use untyped array for more conveniend processing later
              state.head.extra = new Array(state.head.extra_len);
            }
            utils.arraySet(
              state.head.extra,
              input,
              next,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              copy,
              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
              len
            );
            //zmemcpy(state.head.extra + len, next,
            //        len + copy > state.head.extra_max ?
            //        state.head.extra_max - len : copy);
          }
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          state.length -= copy;
        }
        if (state.length) { break inf_leave; }
      }
      state.length = 0;
      state.mode = NAME;
      /* falls through */
    case NAME:
      if (state.flags & 0x0800) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          // TODO: 2 or 1 bytes?
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.name_max*/)) {
            state.head.name += String.fromCharCode(len);
          }
        } while (len && copy < have);

        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.name = null;
      }
      state.length = 0;
      state.mode = COMMENT;
      /* falls through */
    case COMMENT:
      if (state.flags & 0x1000) {
        if (have === 0) { break inf_leave; }
        copy = 0;
        do {
          len = input[next + copy++];
          /* use constant limit because in js we should not preallocate memory */
          if (state.head && len &&
              (state.length < 65536 /*state.head.comm_max*/)) {
            state.head.comment += String.fromCharCode(len);
          }
        } while (len && copy < have);
        if (state.flags & 0x0200) {
          state.check = crc32(state.check, input, copy, next);
        }
        have -= copy;
        next += copy;
        if (len) { break inf_leave; }
      }
      else if (state.head) {
        state.head.comment = null;
      }
      state.mode = HCRC;
      /* falls through */
    case HCRC:
      if (state.flags & 0x0200) {
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.check & 0xffff)) {
          strm.msg = 'header crc mismatch';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
      }
      if (state.head) {
        state.head.hcrc = ((state.flags >> 9) & 1);
        state.head.done = true;
      }
      strm.adler = state.check = 0;
      state.mode = TYPE;
      break;
    case DICTID:
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      strm.adler = state.check = zswap32(hold);
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = DICT;
      /* falls through */
    case DICT:
      if (state.havedict === 0) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        return Z_NEED_DICT;
      }
      strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
      state.mode = TYPE;
      /* falls through */
    case TYPE:
      if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case TYPEDO:
      if (state.last) {
        //--- BYTEBITS() ---//
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        state.mode = CHECK;
        break;
      }
      //=== NEEDBITS(3); */
      while (bits < 3) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.last = (hold & 0x01)/*BITS(1)*/;
      //--- DROPBITS(1) ---//
      hold >>>= 1;
      bits -= 1;
      //---//

      switch ((hold & 0x03)/*BITS(2)*/) {
      case 0:                             /* stored block */
        //Tracev((stderr, "inflate:     stored block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = STORED;
        break;
      case 1:                             /* fixed block */
        fixedtables(state);
        //Tracev((stderr, "inflate:     fixed codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = LEN_;             /* decode codes */
        if (flush === Z_TREES) {
          //--- DROPBITS(2) ---//
          hold >>>= 2;
          bits -= 2;
          //---//
          break inf_leave;
        }
        break;
      case 2:                             /* dynamic block */
        //Tracev((stderr, "inflate:     dynamic codes block%s\n",
        //        state.last ? " (last)" : ""));
        state.mode = TABLE;
        break;
      case 3:
        strm.msg = 'invalid block type';
        state.mode = BAD;
      }
      //--- DROPBITS(2) ---//
      hold >>>= 2;
      bits -= 2;
      //---//
      break;
    case STORED:
      //--- BYTEBITS() ---// /* go to byte boundary */
      hold >>>= bits & 7;
      bits -= bits & 7;
      //---//
      //=== NEEDBITS(32); */
      while (bits < 32) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
        strm.msg = 'invalid stored block lengths';
        state.mode = BAD;
        break;
      }
      state.length = hold & 0xffff;
      //Tracev((stderr, "inflate:       stored length %u\n",
      //        state.length));
      //=== INITBITS();
      hold = 0;
      bits = 0;
      //===//
      state.mode = COPY_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case COPY_:
      state.mode = COPY;
      /* falls through */
    case COPY:
      copy = state.length;
      if (copy) {
        if (copy > have) { copy = have; }
        if (copy > left) { copy = left; }
        if (copy === 0) { break inf_leave; }
        //--- zmemcpy(put, next, copy); ---
        utils.arraySet(output, input, next, copy, put);
        //---//
        have -= copy;
        next += copy;
        left -= copy;
        put += copy;
        state.length -= copy;
        break;
      }
      //Tracev((stderr, "inflate:       stored end\n"));
      state.mode = TYPE;
      break;
    case TABLE:
      //=== NEEDBITS(14); */
      while (bits < 14) {
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
      }
      //===//
      state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
      //--- DROPBITS(5) ---//
      hold >>>= 5;
      bits -= 5;
      //---//
      state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
      //--- DROPBITS(4) ---//
      hold >>>= 4;
      bits -= 4;
      //---//
//#ifndef PKZIP_BUG_WORKAROUND
      if (state.nlen > 286 || state.ndist > 30) {
        strm.msg = 'too many length or distance symbols';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracev((stderr, "inflate:       table sizes ok\n"));
      state.have = 0;
      state.mode = LENLENS;
      /* falls through */
    case LENLENS:
      while (state.have < state.ncode) {
        //=== NEEDBITS(3);
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
        //--- DROPBITS(3) ---//
        hold >>>= 3;
        bits -= 3;
        //---//
      }
      while (state.have < 19) {
        state.lens[order[state.have++]] = 0;
      }
      // We have separate tables & no pointers. 2 commented lines below not needed.
      //state.next = state.codes;
      //state.lencode = state.next;
      // Switch to use dynamic table
      state.lencode = state.lendyn;
      state.lenbits = 7;

      opts = { bits: state.lenbits };
      ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
      state.lenbits = opts.bits;

      if (ret) {
        strm.msg = 'invalid code lengths set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, "inflate:       code lengths ok\n"));
      state.have = 0;
      state.mode = CODELENS;
      /* falls through */
    case CODELENS:
      while (state.have < state.nlen + state.ndist) {
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_val < 16) {
          //--- DROPBITS(here.bits) ---//
          hold >>>= here_bits;
          bits -= here_bits;
          //---//
          state.lens[state.have++] = here_val;
        }
        else {
          if (here_val === 16) {
            //=== NEEDBITS(here.bits + 2);
            n = here_bits + 2;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            if (state.have === 0) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            len = state.lens[state.have - 1];
            copy = 3 + (hold & 0x03);//BITS(2);
            //--- DROPBITS(2) ---//
            hold >>>= 2;
            bits -= 2;
            //---//
          }
          else if (here_val === 17) {
            //=== NEEDBITS(here.bits + 3);
            n = here_bits + 3;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 3 + (hold & 0x07);//BITS(3);
            //--- DROPBITS(3) ---//
            hold >>>= 3;
            bits -= 3;
            //---//
          }
          else {
            //=== NEEDBITS(here.bits + 7);
            n = here_bits + 7;
            while (bits < n) {
              if (have === 0) { break inf_leave; }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            //===//
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            len = 0;
            copy = 11 + (hold & 0x7f);//BITS(7);
            //--- DROPBITS(7) ---//
            hold >>>= 7;
            bits -= 7;
            //---//
          }
          if (state.have + copy > state.nlen + state.ndist) {
            strm.msg = 'invalid bit length repeat';
            state.mode = BAD;
            break;
          }
          while (copy--) {
            state.lens[state.have++] = len;
          }
        }
      }

      /* handle error breaks in while */
      if (state.mode === BAD) { break; }

      /* check for end-of-block code (better have one) */
      if (state.lens[256] === 0) {
        strm.msg = 'invalid code -- missing end-of-block';
        state.mode = BAD;
        break;
      }

      /* build code tables -- note: do not change the lenbits or distbits
         values here (9 and 6) without reading the comments in inftrees.h
         concerning the ENOUGH constants, which depend on those values */
      state.lenbits = 9;

      opts = { bits: state.lenbits };
      ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.lenbits = opts.bits;
      // state.lencode = state.next;

      if (ret) {
        strm.msg = 'invalid literal/lengths set';
        state.mode = BAD;
        break;
      }

      state.distbits = 6;
      //state.distcode.copy(state.codes);
      // Switch to use dynamic table
      state.distcode = state.distdyn;
      opts = { bits: state.distbits };
      ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
      // We have separate tables & no pointers. 2 commented lines below not needed.
      // state.next_index = opts.table_index;
      state.distbits = opts.bits;
      // state.distcode = state.next;

      if (ret) {
        strm.msg = 'invalid distances set';
        state.mode = BAD;
        break;
      }
      //Tracev((stderr, 'inflate:       codes ok\n'));
      state.mode = LEN_;
      if (flush === Z_TREES) { break inf_leave; }
      /* falls through */
    case LEN_:
      state.mode = LEN;
      /* falls through */
    case LEN:
      if (have >= 6 && left >= 258) {
        //--- RESTORE() ---
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        //---
        inflate_fast(strm, _out);
        //--- LOAD() ---
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        //---

        if (state.mode === TYPE) {
          state.back = -1;
        }
        break;
      }
      state.back = 0;
      for (;;) {
        here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if (here_bits <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if (here_op && (here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.lencode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      state.length = here_val;
      if (here_op === 0) {
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        state.mode = LIT;
        break;
      }
      if (here_op & 32) {
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.back = -1;
        state.mode = TYPE;
        break;
      }
      if (here_op & 64) {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break;
      }
      state.extra = here_op & 15;
      state.mode = LENEXT;
      /* falls through */
    case LENEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
      //Tracevv((stderr, "inflate:         length %u\n", state.length));
      state.was = state.length;
      state.mode = DIST;
      /* falls through */
    case DIST:
      for (;;) {
        here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
        here_bits = here >>> 24;
        here_op = (here >>> 16) & 0xff;
        here_val = here & 0xffff;

        if ((here_bits) <= bits) { break; }
        //--- PULLBYTE() ---//
        if (have === 0) { break inf_leave; }
        have--;
        hold += input[next++] << bits;
        bits += 8;
        //---//
      }
      if ((here_op & 0xf0) === 0) {
        last_bits = here_bits;
        last_op = here_op;
        last_val = here_val;
        for (;;) {
          here = state.distcode[last_val +
                  ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((last_bits + here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        //--- DROPBITS(last.bits) ---//
        hold >>>= last_bits;
        bits -= last_bits;
        //---//
        state.back += last_bits;
      }
      //--- DROPBITS(here.bits) ---//
      hold >>>= here_bits;
      bits -= here_bits;
      //---//
      state.back += here_bits;
      if (here_op & 64) {
        strm.msg = 'invalid distance code';
        state.mode = BAD;
        break;
      }
      state.offset = here_val;
      state.extra = (here_op) & 15;
      state.mode = DISTEXT;
      /* falls through */
    case DISTEXT:
      if (state.extra) {
        //=== NEEDBITS(state.extra);
        n = state.extra;
        while (bits < n) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
        //--- DROPBITS(state.extra) ---//
        hold >>>= state.extra;
        bits -= state.extra;
        //---//
        state.back += state.extra;
      }
//#ifdef INFLATE_STRICT
      if (state.offset > state.dmax) {
        strm.msg = 'invalid distance too far back';
        state.mode = BAD;
        break;
      }
//#endif
      //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
      state.mode = MATCH;
      /* falls through */
    case MATCH:
      if (left === 0) { break inf_leave; }
      copy = _out - left;
      if (state.offset > copy) {         /* copy from window */
        copy = state.offset - copy;
        if (copy > state.whave) {
          if (state.sane) {
            strm.msg = 'invalid distance too far back';
            state.mode = BAD;
            break;
          }
// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
        }
        if (copy > state.wnext) {
          copy -= state.wnext;
          from = state.wsize - copy;
        }
        else {
          from = state.wnext - copy;
        }
        if (copy > state.length) { copy = state.length; }
        from_source = state.window;
      }
      else {                              /* copy from output */
        from_source = output;
        from = put - state.offset;
        copy = state.length;
      }
      if (copy > left) { copy = left; }
      left -= copy;
      state.length -= copy;
      do {
        output[put++] = from_source[from++];
      } while (--copy);
      if (state.length === 0) { state.mode = LEN; }
      break;
    case LIT:
      if (left === 0) { break inf_leave; }
      output[put++] = state.length;
      left--;
      state.mode = LEN;
      break;
    case CHECK:
      if (state.wrap) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          // Use '|' insdead of '+' to make sure that result is signed
          hold |= input[next++] << bits;
          bits += 8;
        }
        //===//
        _out -= left;
        strm.total_out += _out;
        state.total += _out;
        if (_out) {
          strm.adler = state.check =
              /*UPDATE(state.check, put - _out, _out);*/
              (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

        }
        _out = left;
        // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
        if ((state.flags ? hold : zswap32(hold)) !== state.check) {
          strm.msg = 'incorrect data check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   check matches trailer\n"));
      }
      state.mode = LENGTH;
      /* falls through */
    case LENGTH:
      if (state.wrap && state.flags) {
        //=== NEEDBITS(32);
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (hold !== (state.total & 0xffffffff)) {
          strm.msg = 'incorrect length check';
          state.mode = BAD;
          break;
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        //Tracev((stderr, "inflate:   length matches trailer\n"));
      }
      state.mode = DONE;
      /* falls through */
    case DONE:
      ret = Z_STREAM_END;
      break inf_leave;
    case BAD:
      ret = Z_DATA_ERROR;
      break inf_leave;
    case MEM:
      return Z_MEM_ERROR;
    case SYNC:
      /* falls through */
    default:
      return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK;
}

exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/


/***/ }),
/* 37 */
/*!************************************************!*\
  !*** ../node_modules/pako/lib/zlib/inffast.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window;               /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};


/***/ }),
/* 38 */
/*!*************************************************!*\
  !*** ../node_modules/pako/lib/zlib/inftrees.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var utils = __webpack_require__(/*! ../utils/common */ 5);

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  var i = 0;
  /* process all codes and make table entries */
  for (;;) {
    i++;
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};


/***/ }),
/* 39 */
/*!*************************************************!*\
  !*** ../node_modules/pako/lib/zlib/gzheader.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

module.exports = GZheader;


/***/ }),
/* 40 */
/*!**********************************************!*\
  !*** ../node_modules/text-encoding/index.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

// This is free and unencumbered software released into the public domain.
// See LICENSE.md for more information.

var encoding = __webpack_require__(/*! ./lib/encoding.js */ 41);

module.exports = {
  TextEncoder: encoding.TextEncoder,
  TextDecoder: encoding.TextDecoder,
};


/***/ }),
/* 41 */
/*!*****************************************************!*\
  !*** ../node_modules/text-encoding/lib/encoding.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

// This is free and unencumbered software released into the public domain.
// See LICENSE.md for more information.

// If we're in node require encoding-indexes and attach it to the global.
/**
 * @fileoverview Global |this| required for resolving indexes in node.
 * @suppress {globalThis}
 */
(function(global) {
  'use strict';

  //
  // Utilities
  //

  /**
   * @param {number} a The number to test.
   * @param {number} min The minimum value in the range, inclusive.
   * @param {number} max The maximum value in the range, inclusive.
   * @return {boolean} True if a >= min and a <= max.
   */
  function inRange(a, min, max) {
    return min <= a && a <= max;
  }

  /**
   * @param {!Array.<*>} array The array to check.
   * @param {*} item The item to look for in the array.
   * @return {boolean} True if the item appears in the array.
   */
  function includes(array, item) {
    return array.indexOf(item) !== -1;
  }

  /**
   * @param {*} o
   * @return {Object}
   */
  function ToDictionary(o) {
    if (o === undefined) return {};
    if (o === Object(o)) return o;
    throw TypeError('Could not convert argument to dictionary');
  }

  /**
   * @param {string} string Input string of UTF-16 code units.
   * @return {!Array.<number>} Code points.
   */
  function stringToCodePoints(string) {
    // https://heycam.github.io/webidl/#dfn-obtain-unicode

    // 1. Let S be the DOMString value.
    var s = String(string);

    // 2. Let n be the length of S.
    var n = s.length;

    // 3. Initialize i to 0.
    var i = 0;

    // 4. Initialize U to be an empty sequence of Unicode characters.
    var u = [];

    // 5. While i < n:
    while (i < n) {

      // 1. Let c be the code unit in S at index i.
      var c = s.charCodeAt(i);

      // 2. Depending on the value of c:

      // c < 0xD800 or c > 0xDFFF
      if (c < 0xD800 || c > 0xDFFF) {
        // Append to U the Unicode character with code point c.
        u.push(c);
      }

      // 0xDC00 ≤ c ≤ 0xDFFF
      else if (0xDC00 <= c && c <= 0xDFFF) {
        // Append to U a U+FFFD REPLACEMENT CHARACTER.
        u.push(0xFFFD);
      }

      // 0xD800 ≤ c ≤ 0xDBFF
      else if (0xD800 <= c && c <= 0xDBFF) {
        // 1. If i = n−1, then append to U a U+FFFD REPLACEMENT
        // CHARACTER.
        if (i === n - 1) {
          u.push(0xFFFD);
        }
        // 2. Otherwise, i < n−1:
        else {
          // 1. Let d be the code unit in S at index i+1.
          var d = s.charCodeAt(i + 1);

          // 2. If 0xDC00 ≤ d ≤ 0xDFFF, then:
          if (0xDC00 <= d && d <= 0xDFFF) {
            // 1. Let a be c & 0x3FF.
            var a = c & 0x3FF;

            // 2. Let b be d & 0x3FF.
            var b = d & 0x3FF;

            // 3. Append to U the Unicode character with code point
            // 2^16+2^10*a+b.
            u.push(0x10000 + (a << 10) + b);

            // 4. Set i to i+1.
            i += 1;
          }

          // 3. Otherwise, d < 0xDC00 or d > 0xDFFF. Append to U a
          // U+FFFD REPLACEMENT CHARACTER.
          else  {
            u.push(0xFFFD);
          }
        }
      }

      // 3. Set i to i+1.
      i += 1;
    }

    // 6. Return U.
    return u;
  }

  /**
   * @param {!Array.<number>} code_points Array of code points.
   * @return {string} string String of UTF-16 code units.
   */
  function codePointsToString(code_points) {
    var s = '';
    for (var i = 0; i < code_points.length; ++i) {
      var cp = code_points[i];
      if (cp <= 0xFFFF) {
        s += String.fromCharCode(cp);
      } else {
        cp -= 0x10000;
        s += String.fromCharCode((cp >> 10) + 0xD800,
                                 (cp & 0x3FF) + 0xDC00);
      }
    }
    return s;
  }


  //
  // Implementation of Encoding specification
  // https://encoding.spec.whatwg.org/
  //

  //
  // 4. Terminology
  //

  /**
   * An ASCII byte is a byte in the range 0x00 to 0x7F, inclusive.
   * @param {number} a The number to test.
   * @return {boolean} True if a is in the range 0x00 to 0x7F, inclusive.
   */
  function isASCIIByte(a) {
    return 0x00 <= a && a <= 0x7F;
  }

  /**
   * An ASCII code point is a code point in the range U+0000 to
   * U+007F, inclusive.
   */
  var isASCIICodePoint = isASCIIByte;


  /**
   * End-of-stream is a special token that signifies no more tokens
   * are in the stream.
   * @const
   */ var end_of_stream = -1;

  /**
   * A stream represents an ordered sequence of tokens.
   *
   * @constructor
   * @param {!(Array.<number>|Uint8Array)} tokens Array of tokens that provide
   * the stream.
   */
  function Stream(tokens) {
    /** @type {!Array.<number>} */
    this.tokens = [].slice.call(tokens);
    // Reversed as push/pop is more efficient than shift/unshift.
    this.tokens.reverse();
  }

  Stream.prototype = {
    /**
     * @return {boolean} True if end-of-stream has been hit.
     */
    endOfStream: function() {
      return !this.tokens.length;
    },

    /**
     * When a token is read from a stream, the first token in the
     * stream must be returned and subsequently removed, and
     * end-of-stream must be returned otherwise.
     *
     * @return {number} Get the next token from the stream, or
     * end_of_stream.
     */
     read: function() {
      if (!this.tokens.length)
        return end_of_stream;
       return this.tokens.pop();
     },

    /**
     * When one or more tokens are prepended to a stream, those tokens
     * must be inserted, in given order, before the first token in the
     * stream.
     *
     * @param {(number|!Array.<number>)} token The token(s) to prepend to the
     * stream.
     */
    prepend: function(token) {
      if (Array.isArray(token)) {
        var tokens = /**@type {!Array.<number>}*/(token);
        while (tokens.length)
          this.tokens.push(tokens.pop());
      } else {
        this.tokens.push(token);
      }
    },

    /**
     * When one or more tokens are pushed to a stream, those tokens
     * must be inserted, in given order, after the last token in the
     * stream.
     *
     * @param {(number|!Array.<number>)} token The tokens(s) to push to the
     * stream.
     */
    push: function(token) {
      if (Array.isArray(token)) {
        var tokens = /**@type {!Array.<number>}*/(token);
        while (tokens.length)
          this.tokens.unshift(tokens.shift());
      } else {
        this.tokens.unshift(token);
      }
    }
  };

  //
  // 5. Encodings
  //

  // 5.1 Encoders and decoders

  /** @const */
  var finished = -1;

  /**
   * @param {boolean} fatal If true, decoding errors raise an exception.
   * @param {number=} opt_code_point Override the standard fallback code point.
   * @return {number} The code point to insert on a decoding error.
   */
  function decoderError(fatal, opt_code_point) {
    if (fatal)
      throw TypeError('Decoder error');
    return opt_code_point || 0xFFFD;
  }

  /**
   * @param {number} code_point The code point that could not be encoded.
   * @return {number} Always throws, no value is actually returned.
   */
  function encoderError(code_point) {
    throw TypeError('The code point ' + code_point + ' could not be encoded.');
  }

  /** @interface */
  function Decoder() {}
  Decoder.prototype = {
    /**
     * @param {Stream} stream The stream of bytes being decoded.
     * @param {number} bite The next byte read from the stream.
     * @return {?(number|!Array.<number>)} The next code point(s)
     *     decoded, or null if not enough data exists in the input
     *     stream to decode a complete code point, or |finished|.
     */
    handler: function(stream, bite) {}
  };

  /** @interface */
  function Encoder() {}
  Encoder.prototype = {
    /**
     * @param {Stream} stream The stream of code points being encoded.
     * @param {number} code_point Next code point read from the stream.
     * @return {(number|!Array.<number>)} Byte(s) to emit, or |finished|.
     */
    handler: function(stream, code_point) {}
  };

  // 5.2 Names and labels

  // TODO: Define @typedef for Encoding: {name:string,labels:Array.<string>}
  // https://github.com/google/closure-compiler/issues/247

  /**
   * @param {string} label The encoding label.
   * @return {?{name:string,labels:Array.<string>}}
   */
  function getEncoding(label) {
    // 1. Remove any leading and trailing ASCII whitespace from label.
    label = String(label).trim().toLowerCase();

    // 2. If label is an ASCII case-insensitive match for any of the
    // labels listed in the table below, return the corresponding
    // encoding, and failure otherwise.
    if (Object.prototype.hasOwnProperty.call(label_to_encoding, label)) {
      return label_to_encoding[label];
    }
    return null;
  }

  /**
   * Encodings table: https://encoding.spec.whatwg.org/encodings.json
   * @const
   * @type {!Array.<{
   *          heading: string,
   *          encodings: Array.<{name:string,labels:Array.<string>}>
   *        }>}
   */
  var encodings = [
    {
      "encodings": [
        {
          "labels": [
            "unicode-1-1-utf-8",
            "utf-8",
            "utf8"
          ],
          "name": "UTF-8"
        }
      ],
      "heading": "The Encoding"
    }
  ];

  // Label to encoding registry.
  /** @type {Object.<string,{name:string,labels:Array.<string>}>} */
  var label_to_encoding = {};
  encodings.forEach(function(category) {
    category.encodings.forEach(function(encoding) {
      encoding.labels.forEach(function(label) {
        label_to_encoding[label] = encoding;
      });
    });
  });

  // Registry of of encoder/decoder factories, by encoding name.
  /** @type {Object.<string, function({fatal:boolean}): Encoder>} */
  var encoders = {};
  /** @type {Object.<string, function({fatal:boolean}): Decoder>} */
  var decoders = {};

  //
  // 8. API
  //

  /** @const */ var DEFAULT_ENCODING = 'utf-8';

  // 8.1 Interface TextDecoder

  /**
   * @constructor
   * @param {string=} label The label of the encoding;
   *     defaults to 'utf-8'.
   * @param {Object=} options
   */
  function TextDecoder(label, options) {
    // Web IDL conventions
    if (!(this instanceof TextDecoder))
      throw TypeError('Called as a function. Did you forget \'new\'?');
    label = label !== undefined ? String(label) : DEFAULT_ENCODING;
    options = ToDictionary(options);

    // A TextDecoder object has an associated encoding, decoder,
    // stream, ignore BOM flag (initially unset), BOM seen flag
    // (initially unset), error mode (initially replacement), and do
    // not flush flag (initially unset).

    /** @private */
    this._encoding = null;
    /** @private @type {?Decoder} */
    this._decoder = null;
    /** @private @type {boolean} */
    this._ignoreBOM = false;
    /** @private @type {boolean} */
    this._BOMseen = false;
    /** @private @type {string} */
    this._error_mode = 'replacement';
    /** @private @type {boolean} */
    this._do_not_flush = false;


    // 1. Let encoding be the result of getting an encoding from
    // label.
    var encoding = getEncoding(label);

    // 2. If encoding is failure or replacement, throw a RangeError.
    if (encoding === null || encoding.name === 'replacement')
      throw RangeError('Unknown encoding: ' + label);
    if (!decoders[encoding.name]) {
      throw Error('Decoder not present.' +
                  ' Did you forget to include encoding-indexes.js?');
    }

    // 3. Let dec be a new TextDecoder object.
    var dec = this;

    // 4. Set dec's encoding to encoding.
    dec._encoding = encoding;

    // 5. If options's fatal member is true, set dec's error mode to
    // fatal.
    if (Boolean(options['fatal']))
      dec._error_mode = 'fatal';

    // 6. If options's ignoreBOM member is true, set dec's ignore BOM
    // flag.
    if (Boolean(options['ignoreBOM']))
      dec._ignoreBOM = true;

    // 7. Return dec.
    return dec;
  }

  if (Object.defineProperty) {
    // The encoding attribute's getter must return encoding's name.
    Object.defineProperty(TextDecoder.prototype, 'encoding', {
      /** @this {TextDecoder} */
      get: function() { return this._encoding.name.toLowerCase(); }
    });

    // The fatal attribute's getter must return true if error mode
    // is fatal, and false otherwise.
    Object.defineProperty(TextDecoder.prototype, 'fatal', {
      /** @this {TextDecoder} */
      get: function() { return this._error_mode === 'fatal'; }
    });

    // The ignoreBOM attribute's getter must return true if ignore
    // BOM flag is set, and false otherwise.
    Object.defineProperty(TextDecoder.prototype, 'ignoreBOM', {
      /** @this {TextDecoder} */
      get: function() { return this._ignoreBOM; }
    });
  }

  /**
   * @param {BufferSource=} input The buffer of bytes to decode.
   * @param {Object=} options
   * @return {string} The decoded string.
   */
  TextDecoder.prototype.decode = function decode(input, options) {
    var bytes;
    if (typeof input === 'object' && input instanceof ArrayBuffer) {
      bytes = new Uint8Array(input);
    } else if (typeof input === 'object' && 'buffer' in input &&
               input.buffer instanceof ArrayBuffer) {
      bytes = new Uint8Array(input.buffer,
                             input.byteOffset,
                             input.byteLength);
    } else {
      bytes = new Uint8Array(0);
    }

    options = ToDictionary(options);

    // 1. If the do not flush flag is unset, set decoder to a new
    // encoding's decoder, set stream to a new stream, and unset the
    // BOM seen flag.
    if (!this._do_not_flush) {
      this._decoder = decoders[this._encoding.name]({
        fatal: this._error_mode === 'fatal'});
      this._BOMseen = false;
    }

    // 2. If options's stream is true, set the do not flush flag, and
    // unset the do not flush flag otherwise.
    this._do_not_flush = Boolean(options['stream']);

    // 3. If input is given, push a copy of input to stream.
    // TODO: Align with spec algorithm - maintain stream on instance.
    var input_stream = new Stream(bytes);

    // 4. Let output be a new stream.
    var output = [];

    /** @type {?(number|!Array.<number>)} */
    var result;

    // 5. While true:
    while (true) {
      // 1. Let token be the result of reading from stream.
      var token = input_stream.read();

      // 2. If token is end-of-stream and the do not flush flag is
      // set, return output, serialized.
      // TODO: Align with spec algorithm.
      if (token === end_of_stream)
        break;

      // 3. Otherwise, run these subsubsteps:

      // 1. Let result be the result of processing token for decoder,
      // stream, output, and error mode.
      result = this._decoder.handler(input_stream, token);

      // 2. If result is finished, return output, serialized.
      if (result === finished)
        break;

      if (result !== null) {
        if (Array.isArray(result))
          output.push.apply(output, /**@type {!Array.<number>}*/(result));
        else
          output.push(result);
      }

      // 3. Otherwise, if result is error, throw a TypeError.
      // (Thrown in handler)

      // 4. Otherwise, do nothing.
    }
    // TODO: Align with spec algorithm.
    if (!this._do_not_flush) {
      do {
        result = this._decoder.handler(input_stream, input_stream.read());
        if (result === finished)
          break;
        if (result === null)
          continue;
        if (Array.isArray(result))
          output.push.apply(output, /**@type {!Array.<number>}*/(result));
        else
          output.push(result);
      } while (!input_stream.endOfStream());
      this._decoder = null;
    }

    // A TextDecoder object also has an associated serialize stream
    // algorithm...
    /**
     * @param {!Array.<number>} stream
     * @return {string}
     * @this {TextDecoder}
     */
    function serializeStream(stream) {
      // 1. Let token be the result of reading from stream.
      // (Done in-place on array, rather than as a stream)

      // 2. If encoding is UTF-8, UTF-16BE, or UTF-16LE, and ignore
      // BOM flag and BOM seen flag are unset, run these subsubsteps:
      if (includes(['UTF-8', 'UTF-16LE', 'UTF-16BE'], this._encoding.name) &&
          !this._ignoreBOM && !this._BOMseen) {
        if (stream.length > 0 && stream[0] === 0xFEFF) {
          // 1. If token is U+FEFF, set BOM seen flag.
          this._BOMseen = true;
          stream.shift();
        } else if (stream.length > 0) {
          // 2. Otherwise, if token is not end-of-stream, set BOM seen
          // flag and append token to stream.
          this._BOMseen = true;
        } else {
          // 3. Otherwise, if token is not end-of-stream, append token
          // to output.
          // (no-op)
        }
      }
      // 4. Otherwise, return output.
      return codePointsToString(stream);
    }

    return serializeStream.call(this, output);
  };

  // 8.2 Interface TextEncoder

  /**
   * @constructor
   * @param {string=} label The label of the encoding. NONSTANDARD.
   * @param {Object=} options NONSTANDARD.
   */
  function TextEncoder(label, options) {
    // Web IDL conventions
    if (!(this instanceof TextEncoder))
      throw TypeError('Called as a function. Did you forget \'new\'?');
    options = ToDictionary(options);

    // A TextEncoder object has an associated encoding and encoder.

    /** @private */
    this._encoding = null;
    /** @private @type {?Encoder} */
    this._encoder = null;

    // Non-standard
    /** @private @type {boolean} */
    this._do_not_flush = false;
    /** @private @type {string} */
    this._fatal = Boolean(options['fatal']) ? 'fatal' : 'replacement';

    // 1. Let enc be a new TextEncoder object.
    var enc = this;

    // 2. Set enc's encoding to UTF-8's encoder.
    // Standard behavior.
    enc._encoding = getEncoding('utf-8');

    if (label !== undefined && 'console' in global) {
      console.warn('TextEncoder constructor called with encoding label, '
                   + 'which is ignored.');
    }

    // 3. Return enc.
    return enc;
  }

  if (Object.defineProperty) {
    // The encoding attribute's getter must return encoding's name.
    Object.defineProperty(TextEncoder.prototype, 'encoding', {
      /** @this {TextEncoder} */
      get: function() { return this._encoding.name.toLowerCase(); }
    });
  }

  /**
   * @param {string=} opt_string The string to encode.
   * @param {Object=} options
   * @return {!Uint8Array} Encoded bytes, as a Uint8Array.
   */
  TextEncoder.prototype.encode = function encode(opt_string, options) {
    opt_string = opt_string ? String(opt_string) : '';
    options = ToDictionary(options);

    // NOTE: This option is nonstandard. None of the encodings
    // permitted for encoding (i.e. UTF-8, UTF-16) are stateful when
    // the input is a USVString so streaming is not necessary.
    if (!this._do_not_flush)
      this._encoder = encoders[this._encoding.name]({
        fatal: this._fatal === 'fatal'});
    this._do_not_flush = Boolean(options['stream']);

    // 1. Convert input to a stream.
    var input = new Stream(stringToCodePoints(opt_string));

    // 2. Let output be a new stream
    var output = [];

    /** @type {?(number|!Array.<number>)} */
    var result;
    // 3. While true, run these substeps:
    while (true) {
      // 1. Let token be the result of reading from input.
      var token = input.read();
      if (token === end_of_stream)
        break;
      // 2. Let result be the result of processing token for encoder,
      // input, output.
      result = this._encoder.handler(input, token);
      if (result === finished)
        break;
      if (Array.isArray(result))
        output.push.apply(output, /**@type {!Array.<number>}*/(result));
      else
        output.push(result);
    }
    // TODO: Align with spec algorithm.
    if (!this._do_not_flush) {
      while (true) {
        result = this._encoder.handler(input, input.read());
        if (result === finished)
          break;
        if (Array.isArray(result))
          output.push.apply(output, /**@type {!Array.<number>}*/(result));
        else
          output.push(result);
      }
      this._encoder = null;
    }
    // 3. If result is finished, convert output into a byte sequence,
    // and then return a Uint8Array object wrapping an ArrayBuffer
    // containing output.
    return new Uint8Array(output);
  };


  //
  // 9. The encoding
  //

  // 9.1 utf-8

  // 9.1.1 utf-8 decoder
  /**
   * @constructor
   * @implements {Decoder}
   * @param {{fatal: boolean}} options
   */
  function UTF8Decoder(options) {
    var fatal = options.fatal;

    // utf-8's decoder's has an associated utf-8 code point, utf-8
    // bytes seen, and utf-8 bytes needed (all initially 0), a utf-8
    // lower boundary (initially 0x80), and a utf-8 upper boundary
    // (initially 0xBF).
    var /** @type {number} */ utf8_code_point = 0,
        /** @type {number} */ utf8_bytes_seen = 0,
        /** @type {number} */ utf8_bytes_needed = 0,
        /** @type {number} */ utf8_lower_boundary = 0x80,
        /** @type {number} */ utf8_upper_boundary = 0xBF;

    /**
     * @param {Stream} stream The stream of bytes being decoded.
     * @param {number} bite The next byte read from the stream.
     * @return {?(number|!Array.<number>)} The next code point(s)
     *     decoded, or null if not enough data exists in the input
     *     stream to decode a complete code point.
     */
    this.handler = function(stream, bite) {
      // 1. If byte is end-of-stream and utf-8 bytes needed is not 0,
      // set utf-8 bytes needed to 0 and return error.
      if (bite === end_of_stream && utf8_bytes_needed !== 0) {
        utf8_bytes_needed = 0;
        return decoderError(fatal);
      }

      // 2. If byte is end-of-stream, return finished.
      if (bite === end_of_stream)
        return finished;

      // 3. If utf-8 bytes needed is 0, based on byte:
      if (utf8_bytes_needed === 0) {

        // 0x00 to 0x7F
        if (inRange(bite, 0x00, 0x7F)) {
          // Return a code point whose value is byte.
          return bite;
        }

        // 0xC2 to 0xDF
        else if (inRange(bite, 0xC2, 0xDF)) {
          // 1. Set utf-8 bytes needed to 1.
          utf8_bytes_needed = 1;

          // 2. Set UTF-8 code point to byte & 0x1F.
          utf8_code_point = bite & 0x1F;
        }

        // 0xE0 to 0xEF
        else if (inRange(bite, 0xE0, 0xEF)) {
          // 1. If byte is 0xE0, set utf-8 lower boundary to 0xA0.
          if (bite === 0xE0)
            utf8_lower_boundary = 0xA0;
          // 2. If byte is 0xED, set utf-8 upper boundary to 0x9F.
          if (bite === 0xED)
            utf8_upper_boundary = 0x9F;
          // 3. Set utf-8 bytes needed to 2.
          utf8_bytes_needed = 2;
          // 4. Set UTF-8 code point to byte & 0xF.
          utf8_code_point = bite & 0xF;
        }

        // 0xF0 to 0xF4
        else if (inRange(bite, 0xF0, 0xF4)) {
          // 1. If byte is 0xF0, set utf-8 lower boundary to 0x90.
          if (bite === 0xF0)
            utf8_lower_boundary = 0x90;
          // 2. If byte is 0xF4, set utf-8 upper boundary to 0x8F.
          if (bite === 0xF4)
            utf8_upper_boundary = 0x8F;
          // 3. Set utf-8 bytes needed to 3.
          utf8_bytes_needed = 3;
          // 4. Set UTF-8 code point to byte & 0x7.
          utf8_code_point = bite & 0x7;
        }

        // Otherwise
        else {
          // Return error.
          return decoderError(fatal);
        }

        // Return continue.
        return null;
      }

      // 4. If byte is not in the range utf-8 lower boundary to utf-8
      // upper boundary, inclusive, run these substeps:
      if (!inRange(bite, utf8_lower_boundary, utf8_upper_boundary)) {

        // 1. Set utf-8 code point, utf-8 bytes needed, and utf-8
        // bytes seen to 0, set utf-8 lower boundary to 0x80, and set
        // utf-8 upper boundary to 0xBF.
        utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;
        utf8_lower_boundary = 0x80;
        utf8_upper_boundary = 0xBF;

        // 2. Prepend byte to stream.
        stream.prepend(bite);

        // 3. Return error.
        return decoderError(fatal);
      }

      // 5. Set utf-8 lower boundary to 0x80 and utf-8 upper boundary
      // to 0xBF.
      utf8_lower_boundary = 0x80;
      utf8_upper_boundary = 0xBF;

      // 6. Set UTF-8 code point to (UTF-8 code point << 6) | (byte &
      // 0x3F)
      utf8_code_point = (utf8_code_point << 6) | (bite & 0x3F);

      // 7. Increase utf-8 bytes seen by one.
      utf8_bytes_seen += 1;

      // 8. If utf-8 bytes seen is not equal to utf-8 bytes needed,
      // continue.
      if (utf8_bytes_seen !== utf8_bytes_needed)
        return null;

      // 9. Let code point be utf-8 code point.
      var code_point = utf8_code_point;

      // 10. Set utf-8 code point, utf-8 bytes needed, and utf-8 bytes
      // seen to 0.
      utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;

      // 11. Return a code point whose value is code point.
      return code_point;
    };
  }

  // 9.1.2 utf-8 encoder
  /**
   * @constructor
   * @implements {Encoder}
   * @param {{fatal: boolean}} options
   */
  function UTF8Encoder(options) {
    var fatal = options.fatal;
    /**
     * @param {Stream} stream Input stream.
     * @param {number} code_point Next code point read from the stream.
     * @return {(number|!Array.<number>)} Byte(s) to emit.
     */
    this.handler = function(stream, code_point) {
      // 1. If code point is end-of-stream, return finished.
      if (code_point === end_of_stream)
        return finished;

      // 2. If code point is in the range U+0000 to U+007F, return a
      // byte whose value is code point.
      if (inRange(code_point, 0x0000, 0x007f))
        return code_point;

      // 3. Set count and offset based on the range code point is in:
      var count, offset;
      // U+0080 to U+07FF, inclusive:
      if (inRange(code_point, 0x0080, 0x07FF)) {
        // 1 and 0xC0
        count = 1;
        offset = 0xC0;
      }
      // U+0800 to U+FFFF, inclusive:
      else if (inRange(code_point, 0x0800, 0xFFFF)) {
        // 2 and 0xE0
        count = 2;
        offset = 0xE0;
      }
      // U+10000 to U+10FFFF, inclusive:
      else if (inRange(code_point, 0x10000, 0x10FFFF)) {
        // 3 and 0xF0
        count = 3;
        offset = 0xF0;
      }

      // 4.Let bytes be a byte sequence whose first byte is (code
      // point >> (6 × count)) + offset.
      var bytes = [(code_point >> (6 * count)) + offset];

      // 5. Run these substeps while count is greater than 0:
      while (count > 0) {

        // 1. Set temp to code point >> (6 × (count − 1)).
        var temp = code_point >> (6 * (count - 1));

        // 2. Append to bytes 0x80 | (temp & 0x3F).
        bytes.push(0x80 | (temp & 0x3F));

        // 3. Decrease count by one.
        count -= 1;
      }

      // 6. Return bytes bytes, in order.
      return bytes;
    };
  }

  /** @param {{fatal: boolean}} options */
  encoders['UTF-8'] = function(options) {
    return new UTF8Encoder(options);
  };
  /** @param {{fatal: boolean}} options */
  decoders['UTF-8'] = function(options) {
    return new UTF8Decoder(options);
  };

  if (!global['TextEncoder'])
    global['TextEncoder'] = TextEncoder;
  if (!global['TextDecoder'])
    global['TextDecoder'] = TextDecoder;

  if ( true && module.exports) {
    module.exports = {
      TextEncoder: global['TextEncoder'],
      TextDecoder: global['TextDecoder']
    };
  }
}(this));


/***/ }),
/* 42 */
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__42__;

/***/ }),
/* 43 */
/*!********************************!*\
  !*** ./format/kdbx-context.js ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var XmlUtils = __webpack_require__(/*! ../utils/xml-utils */ 4);

/**
 * Context with helper methods for load/save
 * @param {Kdbx} opts.kdbx - kdbx file
 * @param {boolean} [opts.exportXml=false] - whether we are exporting as xml
 * @constructor
 */
var KdbxContext = function(opts) {
    this.kdbx = opts.kdbx;
    this.exportXml = opts.exportXml || false;
};

/**
 * Sets XML date, respecting date saving settings
 * @param {Node} node
 * @param {Date} dt
 */
KdbxContext.prototype.setXmlDate = function(node, dt) {
    var isBinary = this.kdbx.header.versionMajor >= 4 && !this.exportXml;
    XmlUtils.setDate(node, dt, isBinary);
};

module.exports = KdbxContext;


/***/ }),
/* 44 */
/*!*************************!*\
  !*** external "xmldom" ***!
  \*************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__44__;

/***/ }),
/* 45 */
/*!******************************************!*\
  !*** ./crypto/hashed-block-transform.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var
    BinaryStream = __webpack_require__(/*! ./../utils/binary-stream */ 11),
    KdbxError = __webpack_require__(/*! ./../errors/kdbx-error */ 2),
    Consts = __webpack_require__(/*! ./../defs/consts */ 1),
    ByteUtils = __webpack_require__(/*! ./../utils/byte-utils */ 0),
    CryptoEngine = __webpack_require__(/*! ./crypto-engine */ 3);

var BlockSize = 1024*1024;

/**
 * Decrypt buffer
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function decrypt(data) {
    return Promise.resolve().then(function() {
        var stm = new BinaryStream(data);
        var buffers = [];
        var blockIndex = 0, blockLength = 0, blockHash, totalLength = 0;

        var next = function() {
            blockIndex = stm.getUint32(true);
            blockHash = stm.readBytes(32);
            blockLength = stm.getUint32(true);
            if (blockLength > 0) {
                totalLength += blockLength;
                var blockData = stm.readBytes(blockLength);
                return CryptoEngine.sha256(blockData).then(function(calculatedHash) {
                    if (!ByteUtils.arrayBufferEquals(calculatedHash, blockHash)) {
                        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'invalid hash block');
                    } else {
                        buffers.push(blockData);
                        return next();
                    }
                });
            } else {
                var ret = new Uint8Array(totalLength);
                var offset = 0;
                for (var i = 0; i < buffers.length; i++) {
                    ret.set(new Uint8Array(buffers[i]), offset);
                    offset += buffers[i].byteLength;
                }
                return ret.buffer;
            }
        };
        return next();
    });
}

/**
 * Encrypt buffer
 * @param {ArrayBuffer} data
 * @returns {Promise.<ArrayBuffer>}
 */
function encrypt(data) {
    return Promise.resolve().then(function() {
        var bytesLeft = data.byteLength;
        var currentOffset = 0, blockIndex = 0, totalLength = 0;
        var buffers = [];

        var next = function() {
            if (bytesLeft > 0) {
                var blockLength = Math.min(BlockSize, bytesLeft);
                bytesLeft -= blockLength;

                var blockData = data.slice(currentOffset, currentOffset + blockLength);
                return CryptoEngine.sha256(blockData).then(function(blockHash) {
                    var blockBuffer = new ArrayBuffer(4 + 32 + 4);
                    var stm = new BinaryStream(blockBuffer);
                    stm.setUint32(blockIndex, true);
                    stm.writeBytes(blockHash);
                    stm.setUint32(blockLength, true);

                    buffers.push(blockBuffer);
                    totalLength += blockBuffer.byteLength;
                    buffers.push(blockData);
                    totalLength += blockData.byteLength;

                    blockIndex++;
                    currentOffset += blockLength;

                    return next();
                });
            } else {
                var endBlockData = new ArrayBuffer(4 + 32 + 4);
                var view = new DataView(endBlockData);
                view.setUint32(0, blockIndex, true);
                buffers.push(endBlockData);
                totalLength += endBlockData.byteLength;

                var ret = new Uint8Array(totalLength);
                var offset = 0;
                for (var i = 0; i < buffers.length; i++) {
                    ret.set(new Uint8Array(buffers[i]), offset);
                    offset += buffers[i].byteLength;
                }
                return ret.buffer;
            }
        };
        return next();
    });
}

module.exports.decrypt = decrypt;
module.exports.encrypt = encrypt;


/***/ }),
/* 46 */
/*!****************************************!*\
  !*** ./crypto/hmac-block-transform.js ***!
  \****************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var
    Int64 = __webpack_require__(/*! ../utils/int64 */ 8),
    KdbxError = __webpack_require__(/*! ../errors/kdbx-error */ 2),
    Consts = __webpack_require__(/*! ../defs/consts */ 1),
    ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0),
    BinaryStream = __webpack_require__(/*! ../utils/binary-stream */ 11),
    CryptoEngine = __webpack_require__(/*! ./crypto-engine */ 3);

var BlockSize = 1024*1024;

/**
 * Computes HMAC-SHA key
 * @param {ArrayBuffer} key
 * @param {Int64} blockIndex
 * @returns {Promise.<ArrayBuffer>}
 */
function getHmacKey(key, blockIndex) {
    var shaSrc = new Uint8Array(8 + key.byteLength);
    shaSrc.set(new Uint8Array(key), 8);
    var view = new DataView(shaSrc.buffer);
    view.setUint32(0, blockIndex.lo, true);
    view.setUint32(4, blockIndex.hi, true);
    return CryptoEngine.sha512(ByteUtils.arrayToBuffer(shaSrc)).then(function(sha) {
        ByteUtils.zeroBuffer(shaSrc);
        return sha;
    });
}

/**
 * Gets block HMAC
 * @param {ArrayBuffer} key
 * @param {number} blockIndex
 * @param {number} blockLength
 * @param {ArrayBuffer} blockData
 * @returns {Promise.<ArrayBuffer>}
 */
function getBlockHmac(key, blockIndex, blockLength, blockData) {
    return getHmacKey(key, new Int64(blockIndex)).then(function(blockKey) {
        var blockDataForHash = new Uint8Array(blockData.byteLength + 4 + 8);
        var blockDataForHashView = new DataView(blockDataForHash.buffer);
        blockDataForHash.set(new Uint8Array(blockData), 4 + 8);
        blockDataForHashView.setInt32(0, blockIndex, true);
        blockDataForHashView.setInt32(8, blockLength, true);
        return CryptoEngine.hmacSha256(blockKey, blockDataForHash.buffer);
    });
}

/**
 * Decrypt buffer
 * @param {ArrayBuffer} data
 * @param {ArrayBuffer} key
 * @returns {Promise.<ArrayBuffer>}
 */
function decrypt(data, key) {
    var stm = new BinaryStream(data);
    return Promise.resolve().then(function() {
        var buffers = [];
        var blockIndex = 0, blockLength = 0, blockHash, totalLength = 0;

        var next = function() {
            blockHash = stm.readBytes(32);
            blockLength = stm.getUint32(true);
            if (blockLength > 0) {
                totalLength += blockLength;
                var blockData = stm.readBytes(blockLength);
                return getBlockHmac(key, blockIndex, blockLength, blockData).then(function(calculatedBlockHash) {
                    if (!ByteUtils.arrayBufferEquals(calculatedBlockHash, blockHash)) {
                        throw new KdbxError(Consts.ErrorCodes.FileCorrupt, 'invalid hash block');
                    } else {
                        buffers.push(blockData);
                        blockIndex++;
                        return next();
                    }
                });
            } else {
                var ret = new Uint8Array(totalLength);
                var offset = 0;
                for (var i = 0; i < buffers.length; i++) {
                    ret.set(new Uint8Array(buffers[i]), offset);
                    offset += buffers[i].byteLength;
                }
                return ret.buffer;
            }
        };
        return next();
    });
}

/**
 * Encrypt buffer
 * @param {ArrayBuffer} data
 * @param {ArrayBuffer} key
 * @returns {Promise.<ArrayBuffer>}
 */
function encrypt(data, key) {
    return Promise.resolve().then(function() {
        var bytesLeft = data.byteLength;
        var currentOffset = 0, blockIndex = 0, totalLength = 0;
        var buffers = [];

        var next = function() {
            var blockLength = Math.min(BlockSize, bytesLeft);
            bytesLeft -= blockLength;

            var blockData = data.slice(currentOffset, currentOffset + blockLength);
            return getBlockHmac(key, blockIndex, blockLength, blockData).then(function(blockHash) {
                var blockBuffer = new ArrayBuffer(32 + 4);
                var stm = new BinaryStream(blockBuffer);
                stm.writeBytes(blockHash);
                stm.setUint32(blockLength, true);

                buffers.push(blockBuffer);
                totalLength += blockBuffer.byteLength;

                if (blockData.byteLength > 0) {
                    buffers.push(blockData);
                    totalLength += blockData.byteLength;
                    blockIndex++;
                    currentOffset += blockLength;
                    return next();
                } else {
                    var ret = new Uint8Array(totalLength);
                    var offset = 0;
                    for (var i = 0; i < buffers.length; i++) {
                        ret.set(new Uint8Array(buffers[i]), offset);
                        offset += buffers[i].byteLength;
                    }
                    return ret.buffer;
                }
            });
        };
        return next();
    });
}

module.exports.getHmacKey = getHmacKey;
module.exports.decrypt = decrypt;
module.exports.encrypt = encrypt;


/***/ }),
/* 47 */
/*!******************************************!*\
  !*** ./crypto/protect-salt-generator.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Salsa20 = __webpack_require__(/*! ./salsa20 */ 23),
    ChaCha20 = __webpack_require__(/*! ./chacha20 */ 24),
    Consts = __webpack_require__(/*! ../defs/consts */ 1),
    KdbxError = __webpack_require__(/*! ../errors/kdbx-error */ 2),
    CryptoEngine = __webpack_require__(/*! ./crypto-engine */ 3),
    ByteUtils = __webpack_require__(/*! ./../utils/byte-utils */ 0);

var SalsaNonce = [0xE8, 0x30, 0x09, 0x4B, 0x97, 0x20, 0x5D, 0x2A];

/**
 * Protect information used for decrypt and encrypt protected data fields
 * @constructor
 */
var ProtectSaltGenerator = function(algo) {
    this.algo = algo;
};

/**
 * Get salt bytes
 * @param {number} len - bytes count
 * @return {ArrayBuffer} - salt bytes
 */
ProtectSaltGenerator.prototype.getSalt = function(len) {
    return ByteUtils.arrayToBuffer(this.algo.getBytes(len));
};

/**
 * Creates protected salt generator
 * @param {ArrayBuffer|Uint8Array} key
 * @param {Number} crsAlgorithm
 * @return {Promise.<ProtectedSaltGenerator>}
 */
ProtectSaltGenerator.create = function(key, crsAlgorithm) {
    switch (crsAlgorithm) {
        case Consts.CrsAlgorithm.Salsa20:
            return CryptoEngine.sha256(ByteUtils.arrayToBuffer(key)).then(function(hash) {
                var key = new Uint8Array(hash);
                var algo = new Salsa20(key, SalsaNonce);
                return new ProtectSaltGenerator(algo);
            });
        case Consts.CrsAlgorithm.ChaCha20:
            return CryptoEngine.sha512(ByteUtils.arrayToBuffer(key)).then(function(hash) {
                var key = new Uint8Array(hash, 0, 32);
                var nonce = new Uint8Array(hash, 32, 12);
                var algo = new ChaCha20(key, nonce);
                return new ProtectSaltGenerator(algo);
            });
        default:
            return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'crsAlgorithm'));
    }
};

module.exports = ProtectSaltGenerator;


/***/ }),
/* 48 */
/*!*************************************!*\
  !*** ./crypto/key-encryptor-kdf.js ***!
  \*************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Consts = __webpack_require__(/*! ../defs/consts */ 1),
    ByteUtils = __webpack_require__(/*! ../utils/byte-utils */ 0),
    VarDictionary = __webpack_require__(/*! ../utils/var-dictionary */ 14),
    Int64 = __webpack_require__(/*! ../utils/int64 */ 8),
    CryptoEngine = __webpack_require__(/*! ../crypto/crypto-engine */ 3),
    KdbxError = __webpack_require__(/*! ../errors/kdbx-error */ 2),
    KeyEncryptorAes = __webpack_require__(/*! ./key-encryptor-aes */ 25);

var KdfFields = [
    { name: 'salt', field: 'S', type: VarDictionary.ValueType.Bytes },
    { name: 'parallelism', field: 'P', type: VarDictionary.ValueType.UInt32 },
    { name: 'memory', field: 'M', type: VarDictionary.ValueType.UInt64 },
    { name: 'iterations', field: 'I', type: VarDictionary.ValueType.UInt64 },
    { name: 'version', field: 'V', type: VarDictionary.ValueType.UInt32 },
    { name: 'secretKey', field: 'K', type: VarDictionary.ValueType.Bytes },
    { name: 'assocData', field: 'A', type: VarDictionary.ValueType.Bytes },
    { name: 'rounds', field: 'R', type: VarDictionary.ValueType.Int64 }
];

/**
 * Derives key from seed using KDF parameters
 * @param {ArrayBuffer} key
 * @param {VarDictionary} kdfParams
 */
function encrypt(key, kdfParams) {
    var uuid = kdfParams.get('$UUID');
    if (!uuid || !(uuid instanceof ArrayBuffer)) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'no kdf uuid'));
    }
    var kdfUuid = ByteUtils.bytesToBase64(uuid);
    switch (kdfUuid) {
        case Consts.KdfId.Argon2:
            return encryptArgon2(key, kdfParams);
        case Consts.KdfId.Aes:
            return encryptAes(key, kdfParams);
        default:
            return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'bad kdf'));
    }
}

function decodeParams(kdfParams) {
    var params = {};
    KdfFields.forEach(function(fieldDef) {
        var value = kdfParams.get(fieldDef.field);
        if (value) {
            if (value instanceof Int64) {
                value = value.value;
            }
            params[fieldDef.name] = value;
        }
    });
    return params;
}

function encryptArgon2(key, kdfParams) {
    var params = decodeParams(kdfParams);
    if (!(params.salt instanceof ArrayBuffer) || params.salt.byteLength !== 32) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 salt'));
    }
    if (typeof params.parallelism !== 'number' || params.parallelism < 1) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 parallelism'));
    }
    if (typeof params.iterations !== 'number' || params.iterations < 1) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 iterations'));
    }
    if (typeof params.memory !== 'number' || params.memory < 1 || params.memory % 1024 !== 0) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 memory'));
    }
    if (params.version !== 0x13 && params.version !== 0x10) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad argon2 version'));
    }
    if (params.secretKey) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'argon2 secret key'));
    }
    if (params.assocData) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.Unsupported, 'argon2 assoc data'));
    }
    return CryptoEngine.argon2(key, params.salt,
        params.memory / 1024, params.iterations,
        32, params.parallelism, 0, params.version);
}

function encryptAes(key, kdfParams) {
    var params = decodeParams(kdfParams);
    if (!(params.salt instanceof ArrayBuffer) || params.salt.byteLength !== 32) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad aes salt'));
    }
    if (typeof params.rounds !== 'number' || params.rounds < 1) {
        return Promise.reject(new KdbxError(Consts.ErrorCodes.FileCorrupt, 'bad aes rounds'));
    }
    return KeyEncryptorAes.encrypt(new Uint8Array(key), new Uint8Array(params.salt), params.rounds).then(function(key) {
        return CryptoEngine.sha256(key).then(function(hash) {
            ByteUtils.zeroBuffer(key);
            return hash;
        });
    });
}

module.exports.encrypt = encrypt;


/***/ }),
/* 49 */
/*!*****************************!*\
  !*** ./format/kdbx-meta.js ***!
  \*****************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var XmlNames = __webpack_require__(/*! ./../defs/xml-names */ 6),
    KdbxUuid = __webpack_require__(/*! ./kdbx-uuid */ 7),
    KdbxCustomData = __webpack_require__(/*! ./kdbx-custom-data */ 15),
    XmlUtils = __webpack_require__(/*! ./../utils/xml-utils */ 4),
    Consts = __webpack_require__(/*! ./../defs/consts */ 1);

var Constants = {
    Generator: 'KdbxWeb'
};

/**
 * Db metadata
 * @constructor
 */
var KdbxMeta = function() {
    this.generator = undefined;
    this.headerHash = undefined;
    this.settingsChanged = undefined;
    this._name = undefined;
    this.nameChanged = undefined;
    this._desc = undefined;
    this.descChanged = undefined;
    this._defaultUser = undefined;
    this.defaultUserChanged = undefined;
    this._mntncHistoryDays = undefined;
    this._color = undefined;
    this.keyChanged = undefined;
    this._keyChangeRec = undefined;
    this._keyChangeForce = undefined;
    this._recycleBinEnabled = undefined;
    this._recycleBinUuid = undefined;
    this.recycleBinChanged = undefined;
    this._entryTemplatesGroup = undefined;
    this.entryTemplatesGroupChanged = undefined;
    this._historyMaxItems = undefined;
    this._historyMaxSize = undefined;
    this._lastSelectedGroup = undefined;
    this._lastTopVisibleGroup = undefined;
    this._memoryProtection = {
        title: undefined, userName: undefined, password: undefined, url: undefined, notes: undefined
    };
    this.customData = {};
    this.customIcons = {};
    this._editState = undefined;
    Object.preventExtensions(this);
};

var props = {
    name: 'nameChanged',
    desc: 'descChanged',
    defaultUser: 'defaultUserChanged',
    mntncHistoryDays: null,
    color: null,
    keyChangeRec: null,
    keyChangeForce: null,
    recycleBinEnabled: 'recycleBinChanged',
    recycleBinUuid: 'recycleBinChanged',
    entryTemplatesGroup: 'entryTemplatesGroupChanged',
    historyMaxItems: null,
    historyMaxSize: null,
    lastSelectedGroup: null,
    lastTopVisibleGroup: null,
    memoryProtection: null
};

Object.keys(props).forEach(function(prop) {
    createProperty(prop, props[prop]);
});

function createProperty(prop, propChanged) {
    var field = '_' + prop;
    Object.defineProperty(KdbxMeta.prototype, prop, {
        enumerable: true,
        get: function() { return this[field]; },
        set: function(value) {
            if (value !== this[field]) {
                this[field] = value;
                if (propChanged) {
                    this[propChanged] = new Date();
                } else {
                    this._setPropModDate(prop);
                }
            }
        }
    });
}

KdbxMeta.prototype._setPropModDate = function(prop) {
    if (!this._editState) {
        this._editState = { };
    }
    this._editState[prop] = new Date().getTime();
};

KdbxMeta.prototype._readNode = function(node, ctx) {
    switch (node.tagName) {
        case XmlNames.Elem.Generator:
            this.generator = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.HeaderHash:
            this.headerHash = XmlUtils.getBytes(node);
            break;
        case XmlNames.Elem.SettingsChanged:
            this.settingsChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbName:
            this._name = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbNameChanged:
            this.nameChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbDesc:
            this._desc = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbDescChanged:
            this.descChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbDefaultUser:
            this._defaultUser = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbDefaultUserChanged:
            this.defaultUserChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbMntncHistoryDays:
            this._mntncHistoryDays = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.DbColor:
            this._color = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.DbKeyChanged:
            this.keyChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.DbKeyChangeRec:
            this._keyChangeRec = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.DbKeyChangeForce:
            this._keyChangeForce = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.RecycleBinEnabled:
            this._recycleBinEnabled = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.RecycleBinUuid:
            this._recycleBinUuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.RecycleBinChanged:
            this.recycleBinChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.EntryTemplatesGroup:
            this._entryTemplatesGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.EntryTemplatesGroupChanged:
            this.entryTemplatesGroupChanged = XmlUtils.getDate(node);
            break;
        case XmlNames.Elem.HistoryMaxItems:
            this._historyMaxItems = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.HistoryMaxSize:
            this._historyMaxSize = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.LastSelectedGroup:
            this._lastSelectedGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.LastTopVisibleGroup:
            this._lastTopVisibleGroup = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.MemoryProt:
            this._readMemoryProtection(node);
            break;
        case XmlNames.Elem.CustomIcons:
            this._readCustomIcons(node);
            break;
        case XmlNames.Elem.Binaries:
            this._readBinaries(node, ctx);
            break;
        case XmlNames.Elem.CustomData:
            this._readCustomData(node);
            break;
    }
};

KdbxMeta.prototype._readMemoryProtection = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.ProtTitle:
                this.memoryProtection.title = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtUserName:
                this.memoryProtection.userName = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtPassword:
                this.memoryProtection.password = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtUrl:
                this.memoryProtection.url = XmlUtils.getBoolean(childNode);
                break;
            case XmlNames.Elem.ProtNotes:
                this.memoryProtection.notes = XmlUtils.getBoolean(childNode);
                break;
        }
    }
};

KdbxMeta.prototype._writeMemoryProtection = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.MemoryProt);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtTitle), this.memoryProtection.title);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtUserName), this.memoryProtection.userName);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtPassword), this.memoryProtection.password);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtUrl), this.memoryProtection.url);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtNotes), this.memoryProtection.notes);
};

KdbxMeta.prototype._readCustomIcons = function(node) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName === XmlNames.Elem.CustomIconItem) {
            this._readCustomIcon(childNode);
        }
    }
};

KdbxMeta.prototype._readCustomIcon = function(node) {
    var uuid, data;
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        switch (childNode.tagName) {
            case XmlNames.Elem.CustomIconItemID:
                uuid = XmlUtils.getUuid(childNode);
                break;
            case XmlNames.Elem.CustomIconItemData:
                data = XmlUtils.getBytes(childNode);
                break;
        }
    }
    if (uuid && data) {
        this.customIcons[uuid] = data;
    }
};

KdbxMeta.prototype._writeCustomIcons = function(parentNode) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomIcons);
    var customIcons = this.customIcons;
    Object.keys(customIcons).forEach(function(uuid) {
        var data = customIcons[uuid];
        if (data) {
            var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconItem);
            XmlUtils.setUuid(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemID), uuid);
            XmlUtils.setBytes(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemData), data);
        }
    });
};

KdbxMeta.prototype._readBinaries = function(node, ctx) {
    for (var i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName === XmlNames.Elem.Binary) {
            this._readBinary(childNode, ctx);
        }
    }
};

KdbxMeta.prototype._readBinary = function(node, ctx) {
    var id = node.getAttribute(XmlNames.Attr.Id);
    var binary = XmlUtils.getProtectedBinary(node);
    if (id && binary) {
        ctx.kdbx.binaries[id] = binary;
    }
};

KdbxMeta.prototype._writeBinaries = function(parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binaries);
    var binaries = ctx.kdbx.binaries;
    binaries.hashOrder.forEach(function(hash, index) {
        var data = binaries[hash];
        if (data) {
            var itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.Binary);
            itemNode.setAttribute(XmlNames.Attr.Id, index.toString());
            XmlUtils.setProtectedBinary(itemNode, data);
        }
    });
};

KdbxMeta.prototype._readCustomData = function(node) {
    this.customData = KdbxCustomData.read(node);
};

KdbxMeta.prototype._writeCustomData = function(parentNode) {
    KdbxCustomData.write(parentNode, this.customData);
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxMeta.prototype.write = function(parentNode, ctx) {
    this.generator = Constants.generator;
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Meta);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Generator), Constants.Generator);
    if (ctx.kdbx.header.versionMajor < 4) {
        XmlUtils.setBytes(XmlUtils.addChildNode(node, XmlNames.Elem.HeaderHash), this.headerHash);
    } else if (this.settingsChanged) {
        ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.SettingsChanged), this.settingsChanged);
    }
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbName), this.name);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbNameChanged), this.nameChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDesc), this.desc);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDescChanged), this.descChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUser), this.defaultUser);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUserChanged), this.defaultUserChanged);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbMntncHistoryDays), this.mntncHistoryDays);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbColor), this.color);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChanged), this.keyChanged);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeRec), this.keyChangeRec);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeForce), this.keyChangeForce);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinEnabled), this.recycleBinEnabled);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinUuid), this.recycleBinUuid);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinChanged), this.recycleBinChanged);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroup), this.entryTemplatesGroup);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroupChanged), this.entryTemplatesGroupChanged);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxItems), this.historyMaxItems);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxSize), this.historyMaxSize);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastSelectedGroup), this.lastSelectedGroup);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleGroup), this.lastTopVisibleGroup);
    this._writeMemoryProtection(node);
    this._writeCustomIcons(node);
    if (ctx.exportXml || ctx.kdbx.header.versionMajor < 4) {
        this._writeBinaries(node, ctx);
    }
    this._writeCustomData(node);
};

/**
 * Merge meta with another db
 * @param {KdbxMeta} remote
 * @param {{objects, remote, deleted}} objectMap
 */
KdbxMeta.prototype.merge = function(remote, objectMap) {
    if (remote.nameChanged > this.nameChanged) {
        this._name = remote.name;
        this.nameChanged = remote.nameChanged;
    }
    if (remote.descChanged > this.descChanged) {
        this._desc = remote.desc;
        this.descChanged = remote.descChanged;
    }
    if (remote.defaultUserChanged > this.defaultUserChanged) {
        this._defaultUser = remote.defaultUser;
        this.defaultUserChanged = remote.defaultUserChanged;
    }
    if (remote.keyChanged > this.keyChanged) {
        this.keyChanged = remote.keyChanged;
    }
    if (remote.settingsChanged > this.settingsChanged) {
        this.settingsChanged = remote.settingsChanged;
    }
    if (remote.recycleBinChanged > this.recycleBinChanged) {
        this._recycleBinEnabled = remote.recycleBinEnabled;
        this._recycleBinUuid = remote.recycleBinUuid;
        this.recycleBinChanged = remote.recycleBinChanged;
    }
    if (remote.entryTemplatesGroupChanged > this.entryTemplatesGroupChanged) {
        this._entryTemplatesGroup = remote.entryTemplatesGroup;
        this.entryTemplatesGroupChanged = remote.entryTemplatesGroupChanged;
    }
    Object.keys(remote.customData).forEach(function(key) {
        if (!this.customData[key] && !objectMap.deleted[key]) {
            this.customData[key] = remote.customData[key];
        }
    }, this);
    Object.keys(remote.customIcons).forEach(function(key) {
        if (!this.customIcons[key] && !objectMap.deleted[key]) {
            this.customIcons[key] = remote.customIcons[key];
        }
    }, this);
    if (!this._editState || !this._editState.historyMaxItems) { this.historyMaxItems = remote.historyMaxItems; }
    if (!this._editState || !this._editState.historyMaxSize) { this.historyMaxSize = remote.historyMaxSize; }
    if (!this._editState || !this._editState.keyChangeRec) { this.keyChangeRec = remote.keyChangeRec; }
    if (!this._editState || !this._editState.keyChangeForce) { this.keyChangeForce = remote.keyChangeForce; }
    if (!this._editState || !this._editState.mntncHistoryDays) { this.mntncHistoryDays = remote.mntncHistoryDays; }
    if (!this._editState || !this._editState.color) { this.color = remote.color; }
};

/**
 * Creates new meta
 * @returns {KdbxMeta}
 */
KdbxMeta.create = function() {
    var now = new Date();
    var meta = new KdbxMeta();
    meta.generator = Constants.Generator;
    meta.settingsChanged = now;
    meta.mntncHistoryDays = Consts.Defaults.MntncHistoryDays;
    meta.recycleBinEnabled = true;
    meta.historyMaxItems = Consts.Defaults.HistoryMaxItems;
    meta.historyMaxSize = Consts.Defaults.HistoryMaxSize;
    meta.nameChanged = now;
    meta.descChanged = now;
    meta.defaultUserChanged = now;
    meta.recycleBinChanged = now;
    meta.keyChangeRec = -1;
    meta.keyChangeForce = -1;
    meta.entryTemplatesGroup = new KdbxUuid();
    meta.entryTemplatesGroupChanged = now;
    meta.memoryProtection = { title: false, userName: false, password: true, url: false, notes: false };
    return meta;
};

/**
 * Read KdbxMeta from stream
 * @param {Node} xmlNode - xml Meta node
 * @param {KdbxContext} ctx
 * @return {KdbxMeta}
 */
KdbxMeta.read = function(xmlNode, ctx) {
    var meta = new KdbxMeta();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            meta._readNode(childNode, ctx);
        }
    }
    return meta;
};

module.exports = KdbxMeta;


/***/ }),
/* 50 */
/*!*********************************!*\
  !*** ./format/kdbx-binaries.js ***!
  \*********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ProtectedValue = __webpack_require__(/*! ./../crypto/protected-value */ 9),
    CryptoEngine = __webpack_require__(/*! ./../crypto/crypto-engine */ 3),
    ByteUtils = __webpack_require__(/*! ./../utils/byte-utils */ 0);

var KdbxBinaries = function() {
    Object.defineProperties(this, {
        idToHash: { value: {} },
        hashOrder: { value: null, configurable: true }
    });
};

KdbxBinaries.prototype.hash = function() {
    var promises = [];
    var that = this;
    Object.keys(that).forEach(function(id) {
        var binary = that[id];
        promises.push(that.getBinaryHash(binary).then(function(hash) {
            that.idToHash[id] = hash;
            that[hash] = that[id];
            delete that[id];
        }));
    });
    return Promise.all(promises);
};

KdbxBinaries.prototype.getBinaryHash = function(binary) {
    var promise;
    if (binary instanceof ProtectedValue) {
        promise = binary.getHash();
    } else if (binary instanceof ArrayBuffer || binary instanceof Uint8Array) {
        binary = ByteUtils.arrayToBuffer(binary);
        promise = CryptoEngine.sha256(binary);
    }
    return promise.then(function(hash) {
        return ByteUtils.bytesToHex(hash);
    });
};

KdbxBinaries.prototype.assignIds = function() {
    Object.defineProperty(this, 'hashOrder', { value: Object.keys(this), configurable: true });
};

KdbxBinaries.prototype.add = function(value) {
    var that = this;
    return this.getBinaryHash(value).then(function(hash) {
        that[hash] = value;
        return { ref: hash, value: value };
    });
};

module.exports = KdbxBinaries;


/***/ }),
/* 51 */
/*!******************************!*\
  !*** ./format/kdbx-group.js ***!
  \******************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var XmlNames = __webpack_require__(/*! ./../defs/xml-names */ 6),
    XmlUtils = __webpack_require__(/*! ./../utils/xml-utils */ 4),
    Consts = __webpack_require__(/*! ../defs/consts */ 1),
    KdbxCustomData = __webpack_require__(/*! ./kdbx-custom-data */ 15),
    KdbxTimes = __webpack_require__(/*! ./kdbx-times */ 27),
    KdbxUuid = __webpack_require__(/*! ./kdbx-uuid */ 7),
    KdbxEntry = __webpack_require__(/*! ./kdbx-entry */ 28);

/**
 * Entries group
 * @constructor
 */
var KdbxGroup = function() {
    this.uuid = undefined;
    this.name = undefined;
    this.notes = undefined;
    this.icon = undefined;
    this.customIcon = undefined;
    this.times = new KdbxTimes();
    this.expanded = undefined;
    this.defaultAutoTypeSeq = undefined;
    this.enableAutoType = undefined;
    this.enableSearching = undefined;
    this.lastTopVisibleEntry = undefined;
    this.groups = [];
    this.entries = [];
    this.parentGroup = undefined;
    this.customData = undefined;
    Object.preventExtensions(this);
};

KdbxGroup.prototype._readNode = function(node, ctx) {
    switch (node.tagName) {
        case XmlNames.Elem.Uuid:
            this.uuid = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Name:
            this.name = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.Notes:
            this.notes = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.Icon:
            this.icon = XmlUtils.getNumber(node);
            break;
        case XmlNames.Elem.CustomIconID:
            this.customIcon = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Times:
            this.times = KdbxTimes.read(node);
            break;
        case XmlNames.Elem.IsExpanded:
            this.expanded = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.GroupDefaultAutoTypeSeq:
            this.defaultAutoTypeSeq = XmlUtils.getText(node);
            break;
        case XmlNames.Elem.EnableAutoType:
            this.enableAutoType = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.EnableSearching:
            this.enableSearching = XmlUtils.getBoolean(node);
            break;
        case XmlNames.Elem.LastTopVisibleEntry:
            this.lastTopVisibleEntry = XmlUtils.getUuid(node);
            break;
        case XmlNames.Elem.Group:
            this.groups.push(KdbxGroup.read(node, ctx, this));
            break;
        case XmlNames.Elem.Entry:
            this.entries.push(KdbxEntry.read(node, ctx, this));
            break;
        case XmlNames.Elem.CustomData:
            this.customData = KdbxCustomData.read(node);
            break;
    }
};

/**
 * Write to stream
 * @param {Node} parentNode - xml document node
 * @param {KdbxContext} ctx
 */
KdbxGroup.prototype.write = function(parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Group);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Name), this.name);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Notes), this.notes);
    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.Icon), this.icon);
    if (this.customIcon) {
        XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
    }
    KdbxCustomData.write(node, this.customData);
    this.times.write(node, ctx);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.IsExpanded), this.expanded);
    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.GroupDefaultAutoTypeSeq), this.defaultAutoTypeSeq);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.EnableAutoType), this.enableAutoType);
    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.EnableSearching), this.enableSearching);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleEntry), this.lastTopVisibleEntry);
    this.groups.forEach(function(g) { g.write(node, ctx); });
    this.entries.forEach(function(e) { e.write(node, ctx); });
};

/**
 * Invokes callback for each entry in recursive way
 * @param {function} callback - will be invoked with entry or group argument
 * @param {function} [thisArg] - callback context
 */
KdbxGroup.prototype.forEach = function(callback, thisArg) {
    callback.call(thisArg, undefined, this);
    this.entries.forEach(function(entry) { callback.call(thisArg, entry); });
    this.groups.forEach(function(group) { group.forEach(callback, thisArg); });
};

/**
 * Merge group with remote group
 * @param {{objects, remote, deleted}} objectMap
 */
KdbxGroup.prototype.merge = function(objectMap) {
    var remoteGroup = objectMap.remote[this.uuid];
    if (!remoteGroup) {
        return;
    }
    if (remoteGroup.times.lastModTime > this.times.lastModTime) {
        this.copyFrom(remoteGroup);
    }
    this.groups = this._mergeCollection(this.groups, remoteGroup.groups, objectMap);
    this.entries = this._mergeCollection(this.entries, remoteGroup.entries, objectMap);
    this.groups.forEach(function(group) { group.merge(objectMap); });
    this.entries.forEach(function(entry) { entry.merge(objectMap); });
};

/**
 * Merge object collection with remote collection
 * Implements 2P-set CRDT with tombstones stored in objectMap.deleted
 * Assumes tombstones are already merged
 * @param {object[]} collection - local groups or entries
 * @param {object[]} remoteCollection - remote groups or entries
 * @param {{objects, remote, deleted}} objectMap - local objects hashmap, remote objects hashmap and tombstones
 * @returns {object[]}
 * @private
 */
KdbxGroup.prototype._mergeCollection = function(collection, remoteCollection, objectMap) {
    var newItems = [];
    collection.forEach(function(item) {
        if (objectMap.deleted[item.uuid]) {
            return; // item deleted
        }
        var remoteItem = objectMap.remote[item.uuid];
        if (!remoteItem) {
            newItems.push(item); // item added locally
        } else if (remoteItem.times.locationChanged <= item.times.locationChanged) {
            newItems.push(item); // item not changed or moved to this group locally later than remote
        }
    }, this);
    remoteCollection.forEach(function(remoteItem, ix) {
        if (objectMap.deleted[remoteItem.uuid]) {
            return; // item already processed as local item or deleted
        }
        var item = objectMap.objects[remoteItem.uuid];
        if (item && remoteItem.times.locationChanged > item.times.locationChanged) {
            item.parentGroup = this; // item moved to this group remotely later than local
            newItems.splice(this._findInsertIx(newItems, remoteCollection, ix), 0, item);
        } else if (!item) {
            var newItem = new remoteItem.constructor(); // item created remotely
            newItem.copyFrom(remoteItem);
            newItem.parentGroup = this;
            newItems.splice(this._findInsertIx(newItems, remoteCollection, ix), 0, newItem);
        }
    }, this);
    return newItems;
};

/**
 * Finds a best place to insert new item into collection
 * @param {object[]} dst - destination collection
 * @param {object[]} src - source item
 * @param {int} srcIx - source item index in collection
 * @returns {int} - index in collection
 * @private
 */
KdbxGroup.prototype._findInsertIx = function(dst, src, srcIx) {
    var selectedIx = dst.length, selectedScore = -1;
    for (var dstIx = 0; dstIx <= dst.length; dstIx++) {
        var score = 0;
        var srcPrev = srcIx > 0 ? src[srcIx - 1].uuid.id : undefined,
            srcNext = srcIx + 1 < src.length ? src[srcIx + 1].uuid.id : undefined,
            dstPrev = dstIx > 0 ? dst[dstIx - 1].uuid.id : undefined,
            dstNext = dstIx < dst.length ? dst[dstIx].uuid.id : undefined;
        if (!srcPrev && !dstPrev) {
            score += 1; // start of sequence
        } else if (srcPrev === dstPrev) {
            score += 5; // previous element equals
        }
        if (!srcNext && !dstNext) {
            score += 2; // end of sequence
        } else if (srcNext === dstNext) {
            score += 5; // next element equals
        }
        if (score > selectedScore) {
            selectedIx = dstIx;
            selectedScore = score;
        }
    }
    return selectedIx;
};

/**
 * Clone group state from another group
 */
KdbxGroup.prototype.copyFrom = function(group) {
    this.uuid = group.uuid;
    this.name = group.name;
    this.notes = group.notes;
    this.icon = group.icon;
    this.customIcon = group.customIcon;
    this.times = group.times.clone();
    this.expanded = group.expanded;
    this.defaultAutoTypeSeq = group.defaultAutoTypeSeq;
    this.enableAutoType = group.enableAutoType;
    this.enableSearching = group.enableSearching;
    this.lastTopVisibleEntry = group.lastTopVisibleEntry;
};

/**
 * Creates new group
 * @param {string} name
 * @param {KdbxGroup} [parentGroup]
 * @returns {KdbxGroup}
 */
KdbxGroup.create = function(name, parentGroup) {
    var group = new KdbxGroup();
    group.uuid = KdbxUuid.random();
    group.icon = Consts.Icons.Folder;
    group.times = KdbxTimes.create();
    group.name = name;
    group.parentGroup = parentGroup;
    group.expanded = true;
    group.enableAutoType = null;
    group.enableSearching = null;
    group.lastTopVisibleEntry = new KdbxUuid();
    return group;
};

/**
 * Read group from xml
 * @param {Node} xmlNode
 * @param {KdbxContext} ctx
 * @param {KdbxGroup} [parentGroup]
 * @return {KdbxGroup}
 */
KdbxGroup.read = function(xmlNode, ctx, parentGroup) {
    var grp = new KdbxGroup();
    for (var i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
        var childNode = cn[i];
        if (childNode.tagName) {
            grp._readNode(childNode, ctx);
        }
    }
    if (!grp.uuid) {
        // some clients don't write ids
        grp.uuid = KdbxUuid.random();
    }
    grp.parentGroup = parentGroup;
    return grp;
};

module.exports = KdbxGroup;


/***/ }),
/* 52 */
/*!***************************************!*\
  !*** ./format/kdbx-deleted-object.js ***!
  \***************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var XmlNames = __webpack_require__(/*! ./../defs/xml-names */ 6),
    XmlUtils = __webpack_require__(/*! ./../utils/xml-utils */ 4);

/**
 * Deleted object
 * @constructor
 */
var KdbxDeletedObject = function() {
    this.uuid = undefined;
    this.deletionTime = undefined;
    Object.preventExtensions(this);
};

KdbxDeletedObject.prototype._readNode = function(node) {
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
KdbxDeletedObject.prototype.write = function(parentNode, ctx) {
    var node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.DeletedObject);
    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DeletionTime), this.deletionTime);
};

/**
 * Read deleted object from xml
 * @param {Node} xmlNode
 * @return {KdbxTimes}
 */
KdbxDeletedObject.read = function(xmlNode) {
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


/***/ })
/******/ ]);
});
//# sourceMappingURL=kdbxweb.js.map