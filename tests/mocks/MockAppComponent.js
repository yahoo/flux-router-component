/**
 * Copyright 2014-2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react/addons');
var RouterComponent = require('../../').RouterComponent;

var MockAppComponent = React.createClass({

    childContextTypes: {
        executeAction: React.PropTypes.func,
        getStore: React.PropTypes.func
    },
    getChildContext: function () {
        return {
            executeAction: this.props.context.executeAction,
            getStore: this.props.context.getStore
        };
    },

    render: function () {
        return React.createElement(RouterComponent, {
            checkRouteOnPageLoad: this.props.checkRouteOnPageLoad,
            enableScroll: this.props.enableScroll,
            historyCreator: this.props.historyCreator,
            ref: 'router'
        }, this.props.children);
    }
});

module.exports = MockAppComponent;
