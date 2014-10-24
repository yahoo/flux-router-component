/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    parseUrl = require('../../../lib/parseUrl');

describe('parse', function () {
    it ('invalid urls', function () {
        expect(parseUrl()).to.equal(null);
        expect(parseUrl(null)).to.equal(null);
    });

    it ('absolute http urls', function () {
        expect(parseUrl('http://something.yahoo.com')).to.eql({path: '/', query: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/')).to.eql({path: '/', query: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/?bar=baz')).to.eql({path: '/', query: '?bar=baz', hash: '#'});
        expect(parseUrl('http://something.yahoo.com#hashfrag')).to.eql({path: '/', query: '?', hash: '#hashfrag'});
        expect(parseUrl('http://something.yahoo.com/foo')).to.eql({path: '/foo', query: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar')).to.eql({path: '/foo/bar', query: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/')).to.eql({path: '/foo/bar', query: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/#hashfrag')).to.eql({path: '/foo/bar', query: '?', hash: '#hashfrag'});
        expect(parseUrl('http://something.yahoo.com/foo/bar#hashfrag')).to.eql({path: '/foo/bar', query: '?', hash: '#hashfrag'});
        expect(parseUrl('http://something.yahoo.com/foo?bar=baz')).to.eql({path: '/foo', query: '?bar=baz', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/?bar=baz&a=b')).to.eql({path: '/foo/bar', query: '?bar=baz&a=b', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/baz?bar=baz&a=b#hashfrag')).to.eql({path: '/foo/bar/baz', query: '?bar=baz&a=b', hash: '#hashfrag'});
    });

    it ('absolute https urls', function () {
        expect(parseUrl('https://something.yahoo.com')).to.eql({path: '/', query: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/')).to.eql({path: '/', query: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/?bar=baz')).to.eql({path: '/', query: '?bar=baz', hash: '#'});
        expect(parseUrl('https://something.yahoo.com#hashfrag')).to.eql({path: '/', query: '?', hash: '#hashfrag'});
        expect(parseUrl('https://something.yahoo.com/foo')).to.eql({path: '/foo', query: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar')).to.eql({path: '/foo/bar', query: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/')).to.eql({path: '/foo/bar', query: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/#hashfrag')).to.eql({path: '/foo/bar', query: '?', hash: '#hashfrag'});
        expect(parseUrl('https://something.yahoo.com/foo/bar#hashfrag')).to.eql({path: '/foo/bar', query: '?', hash: '#hashfrag'});
        expect(parseUrl('https://something.yahoo.com/foo?bar=baz')).to.eql({path: '/foo', query: '?bar=baz', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/?bar=baz&a=b')).to.eql({path: '/foo/bar', query: '?bar=baz&a=b', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/baz?bar=baz&a=b#hashfrag')).to.eql({path: '/foo/bar/baz', query: '?bar=baz&a=b', hash: '#hashfrag'});
    });

    it ('relative urls', function () {
        expect(parseUrl('/')).to.eql({path: '/', query: '?', hash: '#'});
        expect(parseUrl('/?bar=baz')).to.eql({path: '/', query: '?bar=baz', hash: '#'});
        expect(parseUrl('#hashfrag')).to.eql({path: '/', query: '?', hash: '#hashfrag'});
        expect(parseUrl('/foo')).to.eql({path: '/foo', query: '?', hash: '#'});
        expect(parseUrl('/foo/bar')).to.eql({path: '/foo/bar', query: '?', hash: '#'});
        expect(parseUrl('/foo/bar/')).to.eql({path: '/foo/bar', query: '?', hash: '#'});
        expect(parseUrl('/foo/bar/#hashfrag')).to.eql({path: '/foo/bar', query: '?', hash: '#hashfrag'});
        expect(parseUrl('/foo/bar#hashfrag')).to.eql({path: '/foo/bar', query: '?', hash: '#hashfrag'});
        expect(parseUrl('/foo?bar=baz')).to.eql({path: '/foo', query: '?bar=baz', hash: '#'});
        expect(parseUrl('/foo/bar/?bar=baz&a=b')).to.eql({path: '/foo/bar', query: '?bar=baz&a=b', hash: '#'});
        expect(parseUrl('/foo/bar/baz?bar=baz&a=b#hashfrag')).to.eql({path: '/foo/bar/baz', query: '?bar=baz&a=b', hash: '#hashfrag'});
    });
});
