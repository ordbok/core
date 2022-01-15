"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Internals = void 0;
var FS = require("fs");
var Path = require("path");
var dictionary_1 = require("./dictionary");
var markdown_1 = require("./markdown");
var utilities_1 = require("./utilities");
var Internals;
(function (Internals) {
    var PACKAGE = require('../package.json');
    function assembleFiles(sourceFolder, targetFolder, config) {
        var plugins = [];
        config.plugins.forEach(function (pluginPath) {
            return getFiles(pluginPath, /(?:^|\/)ordbok-plugin\.js$/).forEach(function (pluginFile) {
                return plugins.push(require(pluginFile).ordbokPlugin);
            });
        });
        if (plugins.length === 0) {
            console.log(config, plugins);
            return 0;
        }
        plugins.forEach(function (plugin) {
            return plugin.onAssembling &&
                plugin.onAssembling(sourceFolder, targetFolder);
        });
        var assembledCounter = 0;
        getFiles(sourceFolder, /\.(?:md|markdown)$/).forEach(function (sourceFile) {
            var markdown = new markdown_1.Markdown(FS.readFileSync(sourceFile).toString());
            plugins.forEach(function (plugin) {
                return plugin.onReadFile &&
                    plugin.onReadFile(sourceFile, markdown);
            });
            markdown.pages.forEach(function (markdownPage, pageIndex) {
                plugins.forEach(function (plugin) {
                    return plugin.onWriteFile &&
                        plugin.onWriteFile(Path.join(targetFolder, (utilities_1.default.getBaseName(sourceFile) +
                            dictionary_1.default.FILE_SEPARATOR +
                            pageIndex)), markdownPage);
                });
                ++assembledCounter;
            });
        });
        plugins.forEach(function (plugin) {
            return plugin.onAssembled &&
                plugin.onAssembled();
        });
        return assembledCounter;
    }
    Internals.assembleFiles = assembleFiles;
    function getConfig(configPath, defaultConfig) {
        if (!FS.existsSync(configPath)) {
            return defaultConfig;
        }
        var configFolder = Path.dirname(configPath);
        var config = JSON.parse(FS.readFileSync(configPath).toString());
        if (!config.plugins ||
            config.plugins.length === 0) {
            config.plugins = defaultConfig.plugins;
        }
        else {
            config.plugins = config.plugins.map(function (pluginPath) {
                return pluginPath[0] !== Path.sep ?
                    Path.join(configFolder, pluginPath) :
                    pluginPath;
            });
        }
        return config;
    }
    Internals.getConfig = getConfig;
    function getFiles(sourceFolder, pattern) {
        var files = [];
        if (!FS.existsSync(sourceFolder)) {
            return files;
        }
        FS
            .readdirSync(sourceFolder, { withFileTypes: true })
            .forEach(function (sourceEntry) {
            var path = Path.join(sourceFolder, sourceEntry.name);
            if (sourceEntry.isDirectory()) {
                files.push.apply(files, getFiles(path, pattern));
            }
            else if (sourceEntry.isFile() &&
                (!pattern || pattern.test(path))) {
                files.push(path);
            }
        });
        return files;
    }
    Internals.getFiles = getFiles;
    function getVersion() {
        return (PACKAGE.version || '0.0.0');
    }
    Internals.getVersion = getVersion;
    function makeFilePath(filePath) {
        var currentPath = '';
        Path
            .normalize(Path.dirname(filePath))
            .split(Path.sep)
            .map(function (entry, index) {
            return currentPath += (index ? Path.sep : '') + entry;
        })
            .forEach(function (path) {
            return !FS.existsSync(path) ?
                FS.mkdirSync(path) :
                undefined;
        });
    }
    Internals.makeFilePath = makeFilePath;
    function writeFile(filePath, fileContent, options) {
        makeFilePath(filePath);
        FS.writeFileSync(filePath, fileContent, options);
    }
    Internals.writeFile = writeFile;
})(Internals = exports.Internals || (exports.Internals = {}));
exports.default = Internals;
