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
        expect(parseUrl('http://something.yahoo.com')).to.eql({path: '/', pathname: '/', search: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/')).to.eql({path: '/', pathname: '/', search: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/?bar=baz')).to.eql({path: '/?bar=baz', pathname: '/', search: '?bar=baz', hash: '#'});
        expect(parseUrl('http://something.yahoo.com#hashfrag')).to.eql({path: '/', pathname: '/', search: '?', hash: '#hashfrag'});
        expect(parseUrl('http://something.yahoo.com/foo')).to.eql({path: '/foo', pathname: '/foo', search: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/#hashfrag')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#hashfrag'});
        expect(parseUrl('http://something.yahoo.com/foo/bar#hashfrag')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#hashfrag'});
        expect(parseUrl('http://something.yahoo.com/foo?bar=baz')).to.eql({path: '/foo?bar=baz', pathname: '/foo', search: '?bar=baz', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/?bar=baz&a=b')).to.eql({path: '/foo/bar?bar=baz&a=b', pathname: '/foo/bar', search: '?bar=baz&a=b', hash: '#'});
        expect(parseUrl('http://something.yahoo.com/foo/bar/baz?bar=baz&a=b#hashfrag')).to.eql({path: '/foo/bar/baz?bar=baz&a=b', pathname: '/foo/bar/baz', search: '?bar=baz&a=b', hash: '#hashfrag'});
    });

    it ('absolute https urls', function () {
        expect(parseUrl('https://something.yahoo.com')).to.eql({path: '/', pathname: '/', search: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/')).to.eql({path: '/', pathname: '/', search: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/?bar=baz')).to.eql({path: '/?bar=baz', pathname: '/', search: '?bar=baz', hash: '#'});
        expect(parseUrl('https://something.yahoo.com#hashfrag')).to.eql({path: '/', pathname: '/', search: '?', hash: '#hashfrag'});
        expect(parseUrl('https://something.yahoo.com/foo')).to.eql({path: '/foo', pathname: '/foo', search: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/#hashfrag')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#hashfrag'});
        expect(parseUrl('https://something.yahoo.com/foo/bar#hashfrag')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#hashfrag'});
        expect(parseUrl('https://something.yahoo.com/foo?bar=baz')).to.eql({path: '/foo?bar=baz', pathname: '/foo', search: '?bar=baz', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/?bar=baz&a=b')).to.eql({path: '/foo/bar?bar=baz&a=b', pathname: '/foo/bar', search: '?bar=baz&a=b', hash: '#'});
        expect(parseUrl('https://something.yahoo.com/foo/bar/baz?bar=baz&a=b#hashfrag')).to.eql({path: '/foo/bar/baz?bar=baz&a=b', pathname: '/foo/bar/baz', search: '?bar=baz&a=b', hash: '#hashfrag'});
    });

    it ('relative urls', function () {
        expect(parseUrl('/')).to.eql({path: '/', pathname: '/', search: '?', hash: '#'});
        expect(parseUrl('/?bar=baz')).to.eql({path: '/?bar=baz', pathname: '/', search: '?bar=baz', hash: '#'});
        expect(parseUrl('#hashfrag')).to.eql({path: '/', pathname: '/', search: '?', hash: '#hashfrag'});
        expect(parseUrl('/foo')).to.eql({path: '/foo', pathname: '/foo', search: '?', hash: '#'});
        expect(parseUrl('/foo/bar')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#'});
        expect(parseUrl('/foo/bar/')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#'});
        expect(parseUrl('/foo/bar/#hashfrag')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#hashfrag'});
        expect(parseUrl('/foo/bar#hashfrag')).to.eql({path: '/foo/bar', pathname: '/foo/bar', search: '?', hash: '#hashfrag'});
        expect(parseUrl('/foo?bar=baz')).to.eql({path: '/foo?bar=baz', pathname: '/foo', search: '?bar=baz', hash: '#'});
        expect(parseUrl('/foo/bar/?bar=baz&a=b')).to.eql({path: '/foo/bar?bar=baz&a=b', pathname: '/foo/bar', search: '?bar=baz&a=b', hash: '#'});
        expect(parseUrl('/foo/bar/baz?bar=baz&a=b#hashfrag')).to.eql({path: '/foo/bar/baz?bar=baz&a=b', pathname: '/foo/bar/baz', search: '?bar=baz&a=b', hash: '#hashfrag'});
    });
});
