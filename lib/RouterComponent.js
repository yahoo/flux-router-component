/**
 * Copyright 2014-2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';
var React = require('react/addons');
var debug = require('debug')('RouterComponent');
var navigateAction = require('../lib/navigateAction');
var History = require('./History');
var TYPE_CLICK = 'click';
var TYPE_PAGELOAD = 'pageload';
var TYPE_POPSTATE = 'popstate';
var TYPE_DEFAULT = 'default'; // default value if navigation type is missing, for programmatic navigation
var Immutable = require('immutable');

var RouterComponent = React.createClass({
    contextTypes: {
        executeAction: React.PropTypes.func.isRequired,
        getStore: React.PropTypes.func.isRequired
    },

    propTypes: {
        checkRouteOnPageLoad: React.PropTypes.bool,
        enableScroll: React.PropTypes.bool,
        historyCreator: React.PropTypes.func
    },

    getDefaultProps: function () {
        return {
            checkRouteOnPageLoad: false,
            enableScroll: true,
            historyCreator: function () {
                return new History();
            }
        };
    },

    getInitialState: function () {
        return this.getStoreState();
    },

    getStoreState: function () {
        var context = this.context;
        var routeStore = context.getStore('RouteStore');
        return {
            currentRoute: routeStore.getCurrentRoute(),
            currentNavigate: routeStore.getCurrentNavigate()
        };
    },

    componentDidMount: function() {
        this._scrollTimer = null;
        this._history = this.props.historyCreator();

        this.context.getStore('RouteStore').addChangeListener(this._onStoreChange);

        if (this.props.checkRouteOnPageLoad) {
            // You probably want to enable checkRouteOnPageLoad, if you use a history implementation
            // that supports hash route:
            //   At page load, for browsers without pushState AND hash is present in the url,
            //   since hash fragment is not sent to the server side, we need to
            //   dispatch navigate action on browser side to load the actual page content
            //   for the route represented by the hash fragment.

            var urlFromHistory = this._history.getUrl();
            var urlFromState = this.state && this.state.currentRoute && this.state.currentRoute.get('url');

            if ((urlFromHistory !== urlFromState)) {
                debug('pageload navigate to actual route', urlFromHistory, urlFromState);
                this.context.executeAction(navigateAction, {type: TYPE_PAGELOAD, url: urlFromHistory});
            }
        }
        this._history.on(this._onHistoryChange);

        if (this.props.enableScroll) {
            window.addEventListener('scroll', this._onScroll);
        }
    },
    _onScroll: function (e) {
        if (this._scrollTimer) {
            window.clearTimeout(this._scrollTimer);
        }
        this._scrollTimer = window.setTimeout(this._saveScrollPosition, 150);
    },
    _onHistoryChange: function (e) {
        var url = this._history.getUrl();
        var currentUrl = this.state.currentRoute && this.state.currentRoute.get('url');
        debug('history listener invoked', e, url, currentUrl);
        if (url !== currentUrl) {
            this.context.executeAction(navigateAction, {type: TYPE_POPSTATE, url: url, params: (e.state && e.state.params)});
        }
    },
    _saveScrollPosition: function (e) {
        var history = this._history;
        var historyState = (history.getState && history.getState()) || {};
        historyState.scroll = {x: window.scrollX, y: window.scrollY};
        debug('remember scroll position', historyState.scroll);
        history.replaceState(historyState);
    },
    componentWillUnmount: function() {
        this._history.off(this._onHistoryChange);
        this.context.getStore('RouteStore').removeChangeListener(this._onStoreChange);

        if (this.props.enableScroll) {
            window.removeEventListener('scroll', this._onScroll);
        }
    },
    _onStoreChange: function () {
        this.setState(this.getStoreState());
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return !(Immutable.is(nextState.href, this.state.href) &&
        Immutable.is(nextState.currentRoute, this.state.currentRoute));
    },
    componentDidUpdate: function (prevProps, prevState) {
        debug('component did update', prevState, this.state);
        var nav = this.state.currentNavigate;
        var navType = (nav && nav.type) || TYPE_DEFAULT;
        var navParams = nav.params || {};
        var historyState;

        switch (navType) {
            case TYPE_CLICK:
            case TYPE_DEFAULT:
                historyState = {params: navParams};
                if (this.props.enableScroll) {
                    window.scrollTo(0, 0);
                    historyState.scroll = {x: 0, y: 0};
                    debug('on click navigation, reset scroll position to (0, 0)');
                }
                var pageTitle = navParams.pageTitle || null;
                this._history.pushState(historyState, pageTitle, nav.url);
                break;
            case TYPE_POPSTATE:
                if (this.props.enableScroll) {
                    historyState = (this._history.getState && this._history.getState()) || {};
                    var scroll = (historyState && historyState.scroll) || {};
                    debug('on popstate navigation, restore scroll position to ', scroll);
                    window.scrollTo(scroll.x || 0, scroll.y || 0);
                }
                break;
        }
    },

    render: function () {
        if (!this.props.children) {
            return null;
        }
        return React.addons.cloneWithProps(this.props.children, {
            currentRoute: this.state.currentRoute
        });
    }
});

module.exports = RouterComponent;
