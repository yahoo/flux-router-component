/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var History = require('./History'),
    navigateAction = require('../actions/navigate'),
    EVT_PAGELOAD = 'pageload',
    EVT_POPSTATE = 'popstate',
    RouterMixin;

require('setimmediate');

function routesEqual(route1, route2) {
    route1 = route1 || {};
    route2 = route2 || {};
    return (route1.path === route2.path);
}

RouterMixin = {
    componentDidMount: function() {
        var self = this,
            context = self.props.context,
            hash,
            history,
            useHashRoute = self.props.useHashRoute;

        history = self._routerHistory = new History({
            useHashRoute: self.props.useHashRoute,
            hashRouteTransformer: self.props.hashRouteTransformer
        });

        // At page load, for browsers without pushState AND hash is present in the url:
        //   Since hash fragment is not sent to the server side, we need to
        //   dispatch navigate action on browser side to load the actual page content
        //   for the route represented by the hash fragment.
        if (context && useHashRoute && (hash = history.getHash())) {
            // put it in setImmediate, because we need the base component to have
            // store listeners attached, before navigateAction is executed.
            setImmediate(function navigateToHashRoute() {
                context.executeAction(navigateAction, {type: EVT_PAGELOAD, path: hash});
            });
        }

        self._routerPopstateListener = function (e) {
            if (context) {
                var path = history.getPath();
                context.executeAction(navigateAction, {type: EVT_POPSTATE, path: path, params: e.state});
            }
        };
        self._routerHistory.on(self._routerPopstateListener);
    },
    componentWillUnmount: function() {
        this._routerHistory.off(this._routerPopstateListener);
        this._routerPopstateListener = null;
        this._routerHistory = null;
    },
    componentDidUpdate: function (prevProps, prevState) {
        var newState = this.state;
        if (routesEqual(prevState && prevState.route, newState && newState.route)) {
            return;
        }
        var nav = newState.route.navigate;
        if (nav.type !== EVT_POPSTATE && nav.type !== EVT_PAGELOAD) {
            this._routerHistory.pushState(nav.params || null, null, newState.route.path);
        }
    }
};

module.exports = RouterMixin;
