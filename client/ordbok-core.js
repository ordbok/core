#!/usr/bin/env node
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
define("lib/ajax", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AJAX = void 0;
    var AJAX = (function () {
        function AJAX(baseUrl, cacheTimeout, responseTimeout) {
            if (baseUrl === void 0) { baseUrl = ''; }
            if (cacheTimeout === void 0) { cacheTimeout = 3600000; }
            if (responseTimeout === void 0) { responseTimeout = 60000; }
            this._cache = {};
            this._requests = 0;
            this.baseUrl = baseUrl;
            this.cacheTimeout = (cacheTimeout < 0 ? 0 : cacheTimeout);
            this.responseTimeout = (responseTimeout < 0 ? 0 : responseTimeout);
        }
        AJAX.prototype.onError = function (progressEvent) {
            var context = this.context;
            if (!context) {
                return;
            }
            var error = new Error('error');
            error.result = this.response.toString();
            error.serverStatus = this.status;
            error.timestamp = progressEvent.timeStamp;
            error.url = context.url;
            if (context.isCountingRequest) {
                context.isCountingRequest = false;
                context.ajax._requests--;
            }
            context.reject(error);
        };
        AJAX.prototype.onLoad = function (progressEvent) {
            var context = this.context;
            if (!context) {
                return;
            }
            if (context.isCountingRequest) {
                context.isCountingRequest = false;
                context.ajax._requests--;
            }
            context.resolve({
                result: (this.response || '').toString(),
                serverStatus: this.status,
                timestamp: progressEvent.timeStamp,
                url: context.url
            });
        };
        AJAX.prototype.onTimeout = function (progressEvent) {
            var context = this.context;
            if (!context) {
                return;
            }
            var error = new Error('timeout');
            error.result = this.response.toString();
            error.serverStatus = this.status;
            error.timestamp = progressEvent.timeStamp;
            error.url = context.url;
            if (context.isCountingRequest) {
                context.isCountingRequest = false;
                context.ajax._requests--;
            }
            context.reject(error);
        };
        AJAX.prototype.hasOpenRequest = function () {
            if (this._requests < 0) {
                this._requests = 0;
            }
            return (this._requests > 0);
        };
        AJAX.prototype.request = function (urlPath) {
            var ajax = this;
            return new Promise(function (resolve, reject) {
                var url = ajax.baseUrl + urlPath;
                var context = { ajax: ajax, resolve: resolve, reject: reject, url: url };
                if (ajax.cacheTimeout > 0) {
                    var cachedResult = ajax._cache[url];
                    var cacheTimeout = (new Date()).getTime() + ajax.cacheTimeout;
                    if (cachedResult &&
                        cachedResult.timestamp > cacheTimeout) {
                        resolve(cachedResult);
                        return;
                    }
                    delete ajax._cache[url];
                }
                var server = new XMLHttpRequest();
                server.context = context;
                context.isCountingRequest = false;
                try {
                    if (ajax.cacheTimeout <= 0 &&
                        url.indexOf('?') === -1) {
                        server.open('GET', (url + '?' + (new Date()).getTime()), true);
                    }
                    else {
                        server.open('GET', url, true);
                    }
                    ajax._requests++;
                    context.isCountingRequest = true;
                    server.timeout = ajax.responseTimeout;
                    server.addEventListener('load', ajax.onLoad);
                    server.addEventListener('error', ajax.onError);
                    server.addEventListener('timeout', ajax.onTimeout);
                    server.send();
                }
                catch (catchedError) {
                    var error = catchedError;
                    error.result = (server.response || '');
                    error.timestamp = (new Date()).getTime();
                    error.serverStatus = server.status;
                    error.url = context.url;
                    if (context.isCountingRequest) {
                        context.isCountingRequest = false;
                        context.ajax._requests--;
                    }
                    reject(error);
                }
            });
        };
        return AJAX;
    }());
    exports.AJAX = AJAX;
    exports.default = AJAX;
});
define("lib/utilities", ["require", "exports"], function (require, exports) {
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
});
define("lib/markdown", ["require", "exports", "lib/utilities"], function (require, exports, utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Markdown = void 0;
    var HEADLINE_REGEXP = /^(?:#+([\s\S]*)|([\s\S]*?)\n(?:={3,}|-{3,}))$/;
    var PAIR_REGEXP = /^([^\:\n\r\t\v]+):([\s\S]*)$/;
    var PAGE_REGEXP = /(?:^\n?|\n\n)-{3,}(?:\n\n|\n?$)/;
    var PARAGRAPH_REGEXP = /\n{2,}/;
    var Markdown = (function () {
        function Markdown(markdown) {
            this._pages = [];
            this._raw = markdown;
            this.parse(markdown);
        }
        Markdown.parsePage = function (markdownPage) {
            var page = {};
            var match;
            var section;
            markdownPage
                .split(PARAGRAPH_REGEXP)
                .forEach(function (paragraph) {
                match = HEADLINE_REGEXP.exec(paragraph);
                if (match) {
                    page[utilities_1.default.trimSpaces(match[1] || match[2])] = section = {};
                }
                if (!section) {
                    return;
                }
                match = PAIR_REGEXP.exec(paragraph);
                if (match) {
                    section[match[1]] = match[2]
                        .split(';')
                        .map(utilities_1.default.trimSpaces);
                }
            });
            return page;
        };
        Object.defineProperty(Markdown.prototype, "pages", {
            get: function () {
                return this._pages;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Markdown.prototype, "raw", {
            get: function () {
                return this._raw;
            },
            enumerable: false,
            configurable: true
        });
        Markdown.prototype.parse = function (markdown) {
            var pages = this._pages;
            markdown
                .split(PAGE_REGEXP)
                .forEach(function (page) { return pages.push(Markdown.parsePage(page)); });
        };
        return Markdown;
    }());
    exports.Markdown = Markdown;
    exports.default = Markdown;
});
define("lib/dictionary", ["require", "exports", "lib/ajax", "lib/utilities"], function (require, exports, ajax_1, utilities_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Dictionary = void 0;
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
                stringified.push(utilities_2.default.getKey(headline));
                markdownSection = markdownPage[headline];
                Object
                    .keys(markdownSection)
                    .forEach(function (category) {
                    return stringified.push(utilities_2.default.getKey(category) +
                        Dictionary.PAIR_SEPARATOR +
                        markdownSection[category].join(Dictionary.VALUE_SEPARATOR));
                });
            });
            return stringified.join(Dictionary.LINE_SEPARATOR);
        };
        Dictionary.prototype.loadEntry = function (baseName, pageIndex) {
            if (pageIndex === void 0) { pageIndex = 0; }
            return this
                .request(utilities_2.default.getKey(baseName) +
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
});
define("lib/index", ["require", "exports", "lib/ajax", "lib/dictionary", "lib/markdown", "lib/utilities"], function (require, exports, ajax_2, dictionary_1, markdown_1, utilities_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(ajax_2, exports);
    __exportStar(dictionary_1, exports);
    __exportStar(markdown_1, exports);
    __exportStar(utilities_3, exports);
});
/*!---------------------------------------------------------------------------*/
/*! Copyright (c) ORDBOK contributors. All rights reserved.                   */
/*! Licensed under the MIT License. See the LICENSE file in the project root. */
/*!---------------------------------------------------------------------------*/
define("index", ["require", "exports", "lib/index"], function (require, exports, lib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(lib_1, exports);
});
define("lib/internals", ["require", "exports", "fs", "path", "lib/dictionary", "lib/markdown", "lib/utilities"], function (require, exports, FS, Path, dictionary_2, markdown_2, utilities_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Internals = void 0;
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
                var markdown = new markdown_2.Markdown(FS.readFileSync(sourceFile).toString());
                plugins.forEach(function (plugin) {
                    return plugin.onReadFile &&
                        plugin.onReadFile(sourceFile, markdown);
                });
                markdown.pages.forEach(function (markdownPage, pageIndex) {
                    plugins.forEach(function (plugin) {
                        return plugin.onWriteFile &&
                            plugin.onWriteFile(Path.join(targetFolder, (utilities_4.default.getBaseName(sourceFile) +
                                dictionary_2.default.FILE_SEPARATOR +
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
});
define("internals", ["require", "exports", "lib/index", "lib/internals"], function (require, exports, lib_2, internals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(lib_2, exports);
    __exportStar(internals_1, exports);
});
define("bin/ordbok-assembler", ["require", "exports", "path", "internals"], function (require, exports, Path, internals_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ARGV_MAP = {
        '-h': '--help',
        '-v': '--version'
    };
    var ARGV = process.argv.slice(2).map(function (argv) { return ARGV_MAP[argv] || argv; });
    var CORE_PLUGIN = Path.join(__dirname, '..');
    var CWD = process.cwd();
    var DEFAULT_CONFIG = {
        plugins: [CORE_PLUGIN]
    };
    var HELP = "ORDBOK Assembler v" + internals_2.Internals.getVersion() + "\n\nCreates dictionary files out of Markdown files.\n\nordbok-assembler [options] <source> <target>\n\nOptions:\n  -h --help     This help information\n  -v --version  Version";
    function cli() {
        try {
            if (ARGV.includes('--help')) {
                console.log(HELP);
                return;
            }
            if (ARGV.includes('--version')) {
                console.log(internals_2.Internals.getVersion());
                return;
            }
            if (ARGV.length < 2) {
                throw new Error('Invalid arguments');
            }
            var sourceFolder = ARGV[ARGV.length - 2];
            var targetFolder = ARGV[ARGV.length - 1];
            if (sourceFolder[0] === '-' ||
                targetFolder[0] === '-') {
                throw new Error('Invalid arguments');
            }
            var assembledCounter = internals_2.Internals
                .assembleFiles(sourceFolder, targetFolder, internals_2.Internals.getConfig(Path.join(CWD, 'ordbok.json'), DEFAULT_CONFIG));
            console.log('\nAssembled ' + assembledCounter + ' files\n');
        }
        catch (catchedError) {
            error(catchedError);
        }
    }
    function error(error) {
        console.error('\nError: ' + error.message + '\n');
    }
    cli();
});
