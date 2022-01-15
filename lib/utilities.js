"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
var BRACKET_REGEXP = /\([^\)]*\)|\[[^\]]*\]|\{[^\}]*\}/g;
var NON_CHARACTER_REGEXP = /[^0-9A-Za-z\u0080-\uFFFF -]/g;
var PATH_REGEXP = /^(.*?)([^\.\/]*)([^\/]*)$/;
var SPACE_REGEXP = /\s+/g;
var Utilities;
(function (Utilities) {
    function getExtension(filePath) {
        var match = PATH_REGEXP.exec(filePath);
        return (match && match[3] || '');
    }
    Utilities.getExtension = getExtension;
    function getBaseName(filePath) {
        var match = PATH_REGEXP.exec(filePath);
        return (match && match[2] || '');
    }
    Utilities.getBaseName = getBaseName;
    function getKey(text) {
        return text
            .replace(NON_CHARACTER_REGEXP, ' ')
            .trim()
            .replace(SPACE_REGEXP, '-')
            .toLowerCase();
    }
    Utilities.getKey = getKey;
    function getNorm(text) {
        return text
            .replace(NON_CHARACTER_REGEXP, ' ')
            .trim()
            .replace(SPACE_REGEXP, ' ')
            .toLowerCase();
    }
    Utilities.getNorm = getNorm;
    function getParentPath(path) {
        var match = PATH_REGEXP.exec(path);
        return (match && match[1] || '');
    }
    Utilities.getParentPath = getParentPath;
    function removeBrackets(str) {
        return str.replace(BRACKET_REGEXP, '').replace(SPACE_REGEXP, ' ').trim();
    }
    Utilities.removeBrackets = removeBrackets;
    function rotate(text) {
        var isDecode = text.indexOf('base64,') === 0;
        if (isDecode) {
            text = atob(text.substr(7));
        }
        var result = [];
        for (var charCode = 0, index = 0, indexEnd = text.length; index < indexEnd; ++index) {
            charCode = text.charCodeAt(index);
            charCode += (charCode < 128 ? 128 : -128);
            result.push(String.fromCharCode(charCode));
        }
        text = result.join('');
        if (!isDecode) {
            text = 'base64,' + btoa(text);
        }
        return text;
    }
    Utilities.rotate = rotate;
    function splat(obj) {
        if (obj instanceof Array) {
            return obj
                .reduce(function (result, value) {
                if (value && typeof value === 'object') {
                    result.push.apply(result, splat(value));
                }
                else {
                    result.push(value);
                }
                return result;
            }, []);
        }
        else {
            return splat(Object.values(obj));
        }
    }
    Utilities.splat = splat;
    function trimSpaces(str) {
        return str.replace(SPACE_REGEXP, ' ').trim();
    }
    Utilities.trimSpaces = trimSpaces;
})(Utilities = exports.Utilities || (exports.Utilities = {}));
exports.default = Utilities;
