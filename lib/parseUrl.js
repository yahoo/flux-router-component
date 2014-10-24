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
 * @return {Object} URL properties, include: path, pathname, search, hash.
 * @example
 * var parsed = parse('http://somedomain.com:3000/path/to/page?a=1&b=2#hashfragment');
 * console.log(parsed.pathname);  // output /path/to/page
 * console.log(parsed.path);  // output /path/to/page?a=1&b=2
 * console.log(parsed.search); // output ?a=1&b=2
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

    var pathname = matches[2];
    if (pathname[pathname.length - 1] === '/') {
        pathname = pathname.substring(0, pathname.length - 1);
    }
    if (pathname[0] !== '/') {
        pathname = '/' + pathname;
    }

    return {
        path: pathname + (matches[3] || ''),
        pathname: pathname,
        search: matches[3] || '?',
        hash: matches[4] || '#'
    };
}

module.exports = parse;