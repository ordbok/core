"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dictionary = void 0;
var ajax_1 = require("./ajax");
var utilities_1 = require("./utilities");
var Dictionary = (function (_super) {
    __extends(Dictionary, _super);
    function Dictionary() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Dictionary.parse = function (stringified) {
        var dictionaryPage = {};
        var categorySplit;
        var dictionarySection;
        stringified
            .split(Dictionary.LINE_SEPARATOR)
            .forEach(function (line) {
            if (line.indexOf(Dictionary.PAIR_SEPARATOR) === -1) {
                dictionaryPage[line] = dictionarySection = {};
                return;
            }
            if (!dictionarySection) {
                return;
            }
            categorySplit = line.split(Dictionary.PAIR_SEPARATOR, 2);
            dictionarySection[categorySplit[0]] = (categorySplit[1].split(Dictionary.VALUE_SEPARATOR));
        });
        return dictionaryPage;
    };
    Dictionary.stringify = function (markdownPage) {
        var stringified = [];
        var markdownSection;
        Object
            .keys(markdownPage)
            .forEach(function (headline) {
            stringified.push(utilities_1.default.getKey(headline));
            markdownSection = markdownPage[headline];
            Object
                .keys(markdownSection)
                .forEach(function (category) {
                return stringified.push(utilities_1.default.getKey(category) +
                    Dictionary.PAIR_SEPARATOR +
                    markdownSection[category].join(Dictionary.VALUE_SEPARATOR));
            });
        });
        return stringified.join(Dictionary.LINE_SEPARATOR);
    };
    Dictionary.prototype.loadEntry = function (baseName, pageIndex) {
        if (pageIndex === void 0) { pageIndex = 0; }
        return this
            .request(utilities_1.default.getKey(baseName) +
            Dictionary.FILE_SEPARATOR +
            pageIndex +
            Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error ||
                response.serverStatus >= 400) {
                return;
            }
            return Dictionary.parse(response.result);
        })
            .catch(function (error) {
            console.error(error);
            return;
        });
    };
    Dictionary.FILE_EXTENSION = '.txt';
    Dictionary.FILE_SEPARATOR = '-';
    Dictionary.LINE_SEPARATOR = '\n';
    Dictionary.PAIR_SEPARATOR = ':';
    Dictionary.VALUE_SEPARATOR = ';';
    return Dictionary;
}(ajax_1.AJAX));
exports.Dictionary = Dictionary;
exports.default = Dictionary;
