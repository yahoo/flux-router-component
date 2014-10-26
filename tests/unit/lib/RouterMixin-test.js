/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect,
    routerMixin,
    contextMock,
    pushStateMock,
    jsdom = require('jsdom'),
    testResult;

contextMock = {
    executeAction: function (action, payload) {
        testResult.dispatch = {
            action: action,
            payload: payload
        };
    }
};

pushStateMock = function (state, title, url) {
    testResult.pushState = {
        state: state,
        title: title,
        url: url
    };
};

describe('RouterMixin', function () {

    beforeEach(function () {
        routerMixin = require('../../../lib/RouterMixin');
        routerMixin.props = {context: contextMock};
        global.window = jsdom.jsdom().createWindow('<html><body></body></html>');
        global.document = global.window.document;
        global.navigator = global.window.navigator;
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    describe('componentDidMount()', function () {
        it ('listen to popstate event', function () {
            routerMixin.componentDidMount();
            expect(routerMixin._routerPopstateListener).to.be.a('function');
            window.dispatchEvent({_type: 'popstate', state: {a: 1}});
            expect(testResult.dispatch.action).to.be.a('function');
            expect(testResult.dispatch.payload.type).to.equal('popstate');
            expect(testResult.dispatch.payload.path).to.equal(window.location.pathname);
            expect(testResult.dispatch.payload.params).to.eql({a: 1});
        });
    });

    describe('componentWillUnmount()', function () {
        it ('stop listening to popstate event', function () {
            routerMixin.componentDidMount();
            expect(routerMixin._routerPopstateListener).to.be.a('function');
            routerMixin.componentWillUnmount();
            expect(routerMixin._routerPopstateListener).to.equal(null);
            window.dispatchEvent({_type: 'popstate', state: {a: 1}});
            expect(testResult.dispatch).to.equal(undefined);
        });
    });

    describe('componentDidUpdate()', function () {
        it ('no-op on same route', function () {
            var prevRoute = {path: '/foo'},
                newRoute = {path: '/foo'};
            var origPushState = window.history.pushState;
            window.history.pushState = pushStateMock;
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({}, {route: prevRoute});
            expect(testResult.pushState).to.equal(undefined);
            window.history.pushState = origPushState;
        });
        it ('do not pushState, navigate.type=popstate', function () {
            var oldRoute = {path: '/foo'},
                newRoute = {path: '/bar', navigate: {type: 'popstate'}};
            var origPushState = window.history.pushState;
            window.history.pushState = pushStateMock;
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.equal(undefined);
            window.history.pushState = origPushState;
        });
        it ('update with different route, navigate.type=click', function () {
            var oldRoute = {path: '/foo'},
                newRoute = {path: '/bar', navigate: {type: 'click'}};
            var origPushState = window.history.pushState;
            window.history.pushState = pushStateMock;
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: null, title: null, url: '/bar'});
            window.history.pushState = origPushState;
        });
        it ('do not pushState, navigate.type=popstate', function () {
            var oldRoute = {path: '/foo'},
                newRoute = {path: '/bar', navigate: {type: 'popstate'}};
            var origPushState = window.history.pushState;
            window.history.pushState = pushStateMock;
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.equal(undefined);
            window.history.pushState = origPushState;
        });
        it ('update with different route, navigate.type=click, with params', function () {
            var oldRoute = {path: '/foo'},
                newRoute = {path: '/bar', navigate: {type: 'click', params: {foo: 'bar'}}};
            var origPushState = window.history.pushState;
            window.history.pushState = pushStateMock;
            routerMixin.state = {route: newRoute};
            routerMixin.componentDidMount();
            routerMixin.componentDidUpdate({},  {route: oldRoute});
            expect(testResult.pushState).to.eql({state: {foo: 'bar'}, title: null, url: '/bar'});
            window.history.pushState = origPushState;
        });
    });
});
