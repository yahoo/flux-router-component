/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var pathPattern = /^(?:[a-z]+:\/\/[^\/\s]+)?(\/?[^\?#\s]*)/;

/**
 * Simple path parser, to address the needs of flux router component.  It is limited, for example
 * it does not support file:/// urls.
 * @method parsePath
 * @param {String} url  The url string to parse path from. Both absolute and relative urls are supported.
 * @return {String} The normalized path name. E.g. '/' for 'http://foo.com', '/abc' for 'http://foo.com/abc/'
 *                  The query string and hash fragment are not included.
 */
function parsePath(url) {
    if (typeof url !== 'string') {
        return null;
    }

    var matches = url.match(pathPattern);

    var path = matches && matches[1];
    if (path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1);
    }

    if (path[0] !== '/') {
        path = '/' + path;
    }
    return path;
}

module.exports = parsePath;