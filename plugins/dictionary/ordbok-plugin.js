"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordbokPlugin = exports.DictionaryPlugin = void 0;
var internals_1 = require("../../internals");
var DictionaryPlugin = (function () {
    function DictionaryPlugin() {
    }
    DictionaryPlugin.prototype.onWriteFile = function (targetFile, markdownPage) {
        internals_1.Internals.writeFile((targetFile + internals_1.Dictionary.FILE_EXTENSION), internals_1.Dictionary.stringify(markdownPage));
    };
    return DictionaryPlugin;
}());
exports.DictionaryPlugin = DictionaryPlugin;
exports.ordbokPlugin = new DictionaryPlugin();
