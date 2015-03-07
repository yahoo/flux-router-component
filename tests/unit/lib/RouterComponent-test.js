/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var mockery = require('mockery');
var expect = require('chai').expect;
var jsdom = require('jsdom');
var React;
var MockAppComponent;
var RouteStore = require('../../../lib/RouteStore');
var mockAppComponentFactory;
var MockContext = require('fluxible/utils/MockComponentContext')();
var ReactTestUtils;

MockContext.registerStore(RouteStore.withStaticRoutes({
    foo: { path: '/foo', method: 'get' },
    fooA: { path: '/foo/:a', method: 'get' },
    fooAB: { path: '/foo/:a/:b', method: 'get' },
    pathFromHistory: { path: '/the_path_from_history', method: 'get' }
}));

var testResult = {};
var historyMock = function (url, state) {
    return {
        getUrl: function () {
            return url || '/the_path_from_history';
        },
        getState: function () {
            return state;
        },
        on: function (listener) {
            testResult.historyMockOn = listener;
        },
        off: function () {
            testResult.historyMockOn = null;
        },
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
    };
};

var scrollToMock = function (x, y) {
    testResult.scrollTo = {x: x, y: y};
};

describe ('RouterComponent', function () {
    var mockContext;

    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        global.document = jsdom.jsdom('<html><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;
        global.window.scrollTo = scrollToMock;
        React = require('react');
        MockAppComponent = require('../../mocks/MockAppComponent');
        mockAppComponentFactory = React.createFactory(MockAppComponent);
        ReactTestUtils = React.addons.TestUtils;
        mockContext = new MockContext();
        testResult = {};
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    describe('render', function () {
        it('should pass the currentRoute as prop to child', function () {
            var rendered = false;
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            var Child = React.createFactory(React.createClass({
                displayName: 'Child',
                render: function () {
                    rendered = true;
                    expect(this.props.currentRoute).to.be.an('object');
                    expect(this.props.currentRoute.get('url')).to.equal('/foo');
                    return null;
                }
            }));
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext
                }, Child())
            );
            expect(rendered).to.equal(true);
        });
    });

    describe('componentDidMount()', function () {
        it ('listen to popstate event', function () {
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext
                })
            );
            window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0].action).to.be.a('function');
            expect(mockContext.executeActionCalls[0].payload.type).to.equal('popstate');
            expect(mockContext.executeActionCalls[0].payload.url).to.equal(window.location.pathname);
            expect(mockContext.executeActionCalls[0].payload.params).to.deep.equal({a: 1});
        });
        it ('listen to scroll event', function (done) {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/the_path_from_state', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock();
                    }
                })
            );
            window.dispatchEvent({_type: 'scroll'});
            window.dispatchEvent({_type: 'scroll'});
            window.setTimeout(function() {
                expect(testResult.replaceState).to.eql({state: {scroll: {x: 0, y: 0}}, title: undefined, url: undefined});
                done();
            }, 150);
        });
        it ('dispatch navigate event for pages that url does not match', function (done) {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/the_path_from_state', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    checkRouteOnPageLoad: true,
                    historyCreator: function() {
                        return historyMock();
                    }
                })
            );
            window.setTimeout(function() {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.be.a('function');
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('pageload');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/the_path_from_history');
                done();
            }, 150);
        });
        it ('does not dispatch navigate event for pages with matching url', function (done) {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/the_path_from_history', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock();
                    }
                })
            );
            window.setTimeout(function() {
                expect(testResult.dispatch).to.equal(undefined, JSON.stringify(testResult.dispatch));
                done();
            }, 10);
        });
    });

    describe('componentWillUnmount()', function () {
        it ('stop listening to popstate event', function () {
            var component = ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo');
                    }
                })
            );
            component.refs.router.componentWillUnmount();
            expect(testResult.historyMockOn).to.equal(null);
            window.dispatchEvent({_type: 'popstate', state: {params: {a: 1}}});
            expect(testResult.dispatch).to.equal(undefined);
        });
    });

    describe('componentDidUpdate()', function () {
        it ('no-op on same route', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo');
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('do not pushState, navigate.type=popstate', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo');
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', type: 'popstate', method: 'GET'});
            expect(testResult.pushState).to.equal(undefined);
        });
        it ('update with different route, navigate.type=click, reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo');
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.eql({x: 0, y: 0});
        });
        it ('update with different route, navigate.type=click, enableScroll=false, do not reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    enableScroll: false,
                    historyCreator: function() {
                        return historyMock('/foo');
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.equal(undefined);
        });
        it ('update with different route, navigate.type=default, reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo');
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}, scroll: {x: 0, y: 0} }, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.eql({x: 0, y: 0});
        });
        it ('update with different route, navigate.type=default, enableScroll=false, do not reset scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    enableScroll: false,
                    historyCreator: function() {
                        return historyMock('/foo', {scroll: {x: 12, y: 200}});
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET'});
            expect(testResult.pushState).to.eql({state: {params: {}}, title: null, url: '/bar'});
            expect(testResult.scrollTo).to.equal(undefined);
        });
        it ('do not pushState, navigate.type=popstate, restore scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo', {scroll: {x: 12, y: 200}});
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'popstate'});
            expect(testResult.pushState).to.equal(undefined);
            expect(testResult.scrollTo).to.eql({x: 12, y: 200});
        });
        it ('do not pushState, navigate.type=popstate, enableScroll=false, restore scroll position', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    enableScroll: false,
                    historyCreator: function() {
                        return historyMock('/foo', {scroll: {x: 12, y: 200}});
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', method: 'GET', type: 'popstate'});
            expect(testResult.pushState).to.equal(undefined);
            expect(testResult.scrollTo).to.eql(undefined);

        });
        it ('update with different route, navigate.type=click, with params', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo#hash1');
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/bar', type: 'click', params: {foo: 'bar'}});
            expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y:0}}, title: null, url: '/bar'});
        });
        it ('update with same path and different hash, navigate.type=click, with params', function () {
            var routeStore = mockContext.getStore('RouteStore');
            routeStore.handleNavigateStart({url: '/foo#hash1', method: 'GET'});
            ReactTestUtils.renderIntoDocument(
                mockAppComponentFactory({
                    context: mockContext,
                    historyCreator: function() {
                        return historyMock('/foo#hash1');
                    }
                })
            );
            routeStore.handleNavigateStart({url: '/foo#hash2', type: 'click', params: {foo: 'bar'}});
            expect(testResult.pushState).to.eql({state: {params: {foo: 'bar'}, scroll: {x: 0, y:0}}, title: null, url: '/foo#hash2'});
        });
    });

});
