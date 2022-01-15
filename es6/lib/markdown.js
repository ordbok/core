import Utilities from './utilities';
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
                page[Utilities.trimSpaces(match[1] || match[2])] = section = {};
            }
            if (!section) {
                return;
            }
            match = PAIR_REGEXP.exec(paragraph);
            if (match) {
                section[match[1]] = match[2]
                    .split(';')
                    .map(Utilities.trimSpaces);
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
export { Markdown };
export default Markdown;
