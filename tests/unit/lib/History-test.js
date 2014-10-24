/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var History = require('../../../lib/History'),
    expect = require('chai').expect,
    _ = require('lodash'),
    windowMock,
    testResult;

windowMock = {
    HTML5: {
        history: {
            pushState: function (state, title, url) {
                testResult.pushState = {
                    state: state,
                    title: title,
                    url: url
                };
            },
            replaceState: function (state, title, url) {
                testResult.replaceState = {
                    state: state,
                    title: title,
                    url: url
                };
            }
        },
        addEventListener: function (evt, listener) {
            testResult.addEventListener = {
                evt: evt,
                listener: listener
            };
        },
        removeEventListener: function (evt, listener) {
            testResult.removeEventListener = {
                evt: evt,
                listener: listener
            };
        }
    },
    OLD: {
        addEventListener: function (evt, listener) {
            testResult.addEventListener = {
                evt: evt,
                listener: listener
            };
        },
        removeEventListener: function (evt, listener) {
            testResult.removeEventListener = {
                evt: evt,
                listener: listener
            };
        }
    }
};

describe('History', function () {

    beforeEach(function () {
        testResult = {};
    });

    describe('constructor', function () {
        it ('has pushState', function () {
            var history = new History(windowMock.HTML5);
            expect(history.win).to.equal(windowMock.HTML5);
            expect(history._hasPushState).to.equal(true);
            expect(history._popstateEvt).to.equal('popstate');
        });
        it ('no pushState', function () {
            var history = new History(windowMock.OLD);
            expect(history.win).to.equal(windowMock.OLD);
            expect(history._hasPushState).to.equal(false);
            expect(history._popstateEvt).to.equal('hashchange');
        });
    });

    describe('hasPushState', function () {
        it ('has pushState', function () {
            var history = new History(windowMock.HTML5);
            expect(history.win).to.equal(windowMock.HTML5);
            expect(history.hasPushState()).to.equal(true);
        });
        it ('no pushState', function () {
            var history = new History(windowMock.OLD);
            expect(history.win).to.equal(windowMock.OLD);
            expect(history.hasPushState()).to.equal(false);
        });
    });

    describe('on', function () {
        it ('has pushState', function () {
            var history = new History(windowMock.HTML5);
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).to.eql({evt: 'popstate', listener: listener});
        });
        it ('no pushState', function () {
            var history = new History(windowMock.OLD);
            var listener = function () {};
            history.on(listener);
            expect(testResult.addEventListener).to.eql({evt: 'hashchange', listener: listener});
        });
    });

    describe('off', function () {
        it ('has pushState', function () {
            var history = new History(windowMock.HTML5);
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).to.eql({evt: 'popstate', listener: listener});
        });
        it ('no pushState', function () {
            var history = new History(windowMock.OLD);
            var listener = function () {};
            history.off(listener);
            expect(testResult.removeEventListener).to.eql({evt: 'hashchange', listener: listener});
        });
    });

    describe('getHash', function () {
        it ('empty hash', function () {
            var win = _.extend(windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#'
                }
            });
            var history = new History(win);
            var hash = history.getHash();
            expect(hash).to.equal('');
        });
        it ('non-empty hash', function () {
            var win = _.extend(windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc'
                }
            });
            var history = new History(win);
            var hash = history.getHash();
            expect(hash).to.equal('/path/to/abc');
        });
    });

    describe('getPath', function () {
        it ('has pushState', function () {
            var win = _.extend(windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc'
                }
            });
            var history = new History(win);
            var path = history.getPath();
            expect(path).to.equal('/path/to/page');
        });
        it ('no pushState', function () {
            var win, history, path;
            win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#/path/to/abc'
                }
            });
            history = new History(win);
            path = history.getPath();
            expect(path).to.equal('/path/to/abc');

            win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: '#'
                }
            });
            history = new History(win);
            path = history.getPath();
            expect(path).to.equal('/path/to/page');

            win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/path/to/page',
                    hash: ''
                }
            });
            history = new History(win);
            path = history.getPath();
            expect(path).to.equal('/path/to/page');
        });
    });

    describe('getRelativeUrl', function () {
        it ('has pushState', function () {
            var win = _.extend(windowMock.HTML5, {
                location: {
                    pathname: '/path/to/page',
                    search: '?abc=1&def=2',
                    hash: '#frag1'
                }
            });
            var history = new History(win);
            var relativeUrl = history.getRelativeUrl();
            expect(relativeUrl).to.equal('/path/to/page?abc=1&def=2#frag1');
        });
        it ('no pushState', function () {
            var win = _.extend(windowMock.OLD, {
                location: {
                    pathname: '/ignored_path',
                    search: '?abc=1&def=2',
                    hash: '#/hashpath/to/page'
                }
            });
            var history = new History(win);
            var relativeUrl = history.getRelativeUrl();
            expect(relativeUrl).to.equal('/hashpath/to/page?abc=1&def=2');
        });
    });

    describe('pushState', function () {
        it ('has pushState', function () {
            var history = new History(windowMock.HTML5);

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/url');

            history.pushState({foo: 'bar'}, 't', '/url?a=b&c=d');
            expect(testResult.pushState.state).to.eql({foo: 'bar'});
            expect(testResult.pushState.title).to.equal('t');
            expect(testResult.pushState.url).to.equal('/url?a=b&c=d', 'with query');
        });
        it ('no pushState', function () {
            var win = _.extend(windowMock.OLD, {
                // location: {}
                location: {
                    protocol: 'http:',
                    host: 'mydomain.com',
                    pathname: '/path'
                }
            });
            var history = new History(win);

            history.pushState({foo: 'bar'}, 't', '/url');
            expect(win.location.href).to.equal('http://mydomain.com/path#/url');
            history.pushState({foo: 'bar'}, 't', 'http://mydomain.com/path/to/url');
            expect(win.location.href).to.equal('http://mydomain.com/path#/path/to/url');

            history.pushState({foo: 'bar'}, 't', '/url?a=b&c=d');
            expect(win.location.href).to.equal('http://mydomain.com/path?a=b&c=d#/url', 'with query');
            history.pushState({foo: 'bar'}, 't', 'http://mydomain.com/path/to/url?a=b&c=d');
            expect(win.location.href).to.equal('http://mydomain.com/path?a=b&c=d#/path/to/url', 'absolute path with query');
        });
    });

    describe('replaceState', function () {
        it ('has pushState', function () {
            var history = new History(windowMock.HTML5);
            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.replaceState.state).to.eql({foo: 'bar'});
            expect(testResult.replaceState.title).to.equal('t');
            expect(testResult.replaceState.url).to.equal('/url');
        });
        it ('no pushState', function () {
            var win = _.extend(windowMock.OLD, {
                location: {
                    protocol: 'http:',
                    host: 'mydomain.com',
                    pathname: '/path',
                    replace: function(url) {
                        testResult.locationReplace = {url: url};
                    }
                }
            });
            var history = new History(win);
            history.replaceState({foo: 'bar'}, 't', '/url');
            expect(testResult.locationReplace.url).to.equal('http://mydomain.com/path#/url', 'without query');
            history.replaceState({foo: 'bar'}, 't', '/url?a=1');
            expect(testResult.locationReplace.url).to.equal('http://mydomain.com/path?a=1#/url', 'with query');
        });
    });

});
