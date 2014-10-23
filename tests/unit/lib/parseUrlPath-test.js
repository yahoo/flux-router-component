/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    parseUrlPath = require('../../../lib/parseUrlPath');

describe('parseUrlPath', function () {
    it ('invalid urls', function () {
        expect(parseUrlPath()).to.equal(null);
        expect(parseUrlPath(null)).to.equal(null);
    });

    it ('absolute http urls', function () {
        expect(parseUrlPath('http://something.yahoo.com')).to.equal('/');
        expect(parseUrlPath('http://something.yahoo.com/')).to.equal('/');
        expect(parseUrlPath('http://something.yahoo.com/?bar=baz')).to.equal('/');
        expect(parseUrlPath('http://something.yahoo.com#hashfrag')).to.equal('/');
        expect(parseUrlPath('http://something.yahoo.com/foo')).to.equal('/foo');
        expect(parseUrlPath('http://something.yahoo.com/foo/bar')).to.equal('/foo/bar');
        expect(parseUrlPath('http://something.yahoo.com/foo/bar/')).to.equal('/foo/bar');
        expect(parseUrlPath('http://something.yahoo.com/foo/bar/#hashfrag')).to.equal('/foo/bar');
        expect(parseUrlPath('http://something.yahoo.com/foo/bar#hashfrag')).to.equal('/foo/bar');
        expect(parseUrlPath('http://something.yahoo.com/foo?bar=baz')).to.equal('/foo');
        expect(parseUrlPath('http://something.yahoo.com/foo/bar/?bar=baz&a=b')).to.equal('/foo/bar');
        expect(parseUrlPath('http://something.yahoo.com/foo/bar/baz?bar=baz&a=b#hashfrag')).to.equal('/foo/bar/baz');
    });

    it ('absolute https urls', function () {
        expect(parseUrlPath('https://something.yahoo.com')).to.equal('/');
        expect(parseUrlPath('https://something.yahoo.com/')).to.equal('/');
        expect(parseUrlPath('https://something.yahoo.com/foo')).to.equal('/foo');
        expect(parseUrlPath('https://something.yahoo.com/foo/bar')).to.equal('/foo/bar');
        expect(parseUrlPath('https://something.yahoo.com/foo/bar/')).to.equal('/foo/bar');
        expect(parseUrlPath('https://something.yahoo.com/foo/bar#hashfrag')).to.equal('/foo/bar');
        expect(parseUrlPath('https://something.yahoo.com/foo?bar=baz')).to.equal('/foo');
        expect(parseUrlPath('https://something.yahoo.com/foo/bar/?bar=baz&a=b')).to.equal('/foo/bar');
        expect(parseUrlPath('https://something.yahoo.com/foo/bar/baz?bar=baz&a=b#hashfrag')).to.equal('/foo/bar/baz');
    });

    it ('relative urls', function () {
        expect(parseUrlPath('/')).to.equal('/');
        expect(parseUrlPath('/foo')).to.equal('/foo');
        expect(parseUrlPath('/foo/bar')).to.equal('/foo/bar');
        expect(parseUrlPath('/foo/bar/')).to.equal('/foo/bar');
        expect(parseUrlPath('/foo/bar#hashfrag')).to.equal('/foo/bar');
        expect(parseUrlPath('/foo?bar=baz')).to.equal('/foo');
        expect(parseUrlPath('/foo/bar/?bar=baz&a=b')).to.equal('/foo/bar');
        expect(parseUrlPath('/foo/bar/baz?bar=baz&a=b#hashfrag')).to.equal('/foo/bar/baz');
    });
});
