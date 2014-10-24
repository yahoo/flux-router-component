/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var pattern = /^([a-z]+:\/\/[^\/\s\?#]+)?(\/?[^\?#\s]*)(\??[^\?#\s]*)(#?[^\s]*)/;

/**
 * Simple url parser, to address the needs of flux router component.  It is limited, for example
 * it does not support file:/// urls.
 * @method parse
 * @param {String} url  The url string to parse path from. Both absolute and relative urls are supported.
 * @return {Object} URL properties, include: path, query, hash.
 * @example
 * var parsed = parse('http://somedomain.com:3000/path/to/page?a=1&b=2#hashfragment');
 * console.log(parsed.path);  // output /path/to/page
 * console.log(parsed.query); // output ?a=1&b=2
 * console.log(parsed.hash);  // output #hashfragment
 */
function parse(url) {
    if (typeof url !== 'string') {
        return null;
    }

    var matches = url.match(pattern);
    if (!matches) {
        return null;
    }

    var path = matches[2];
    if (path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1);
    }
    if (path[0] !== '/') {
        path = '/' + path;
    }

    return {
        path: path,
        query: matches[3] || '?',
        hash: matches[4] || '#'
    };
}

module.exports = parse;