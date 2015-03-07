/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var React = require('react/addons');
var navigateAction = require('./navigateAction');
var debug = require('debug')('NavLink');
var objectAssign = require('object-assign');

function isLeftClickEvent (e) {
    return e.button === 0;
}

function isModifiedEvent (e) {
    return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

var NavLink = React.createClass({
    displayName: 'NavLink',
    contextTypes: {
        executeAction: React.PropTypes.func,
        getStore: React.PropTypes.func
    },
    propTypes: {
        context: React.PropTypes.object,
        href: React.PropTypes.string,
        routeName: React.PropTypes.string,
        navParams: React.PropTypes.object,
        followLink: React.PropTypes.bool
    },
    getInitialState: function () {
        var href = this._getHrefFromProps(this.props);
        return {
            href: this._getHrefFromProps(this.props),
            isActive: this._getRouteStore().isActive(href)
        };
    },
    componentWillReceiveProps: function (nextProps) {
        var href = this._getHrefFromProps(nextProps);
        this.setState({
            href: this._getHrefFromProps(nextProps),
            isActive: this._getRouteStore().isActive(href)
        });
    },
    componentDidMount: function () {
        this._getRouteStore().addChangeListener(this._onStoreChange);
    },
    componentWillUnmount: function () {
        this._getRouteStore().removeChangeListener(this._onStoreChange);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return nextState.isActive !== this.state.isActive;
    },
    _onStoreChange: function () {
        var isActive = this._getRouteStore().isActive(this.state.href);
        this.setState({
            isActive: isActive
        });
    },
    _getRouteStore: function () {
        var context = this.props.context || this.context;
        if (!context || !context.getStore) {
            throw new Error('context not available within NavLink component');
        }
        return context.getStore('RouteStore');
    },
    _getHrefFromProps: function (props) {
        var href = props.href;
        var routeName = props.routeName;
        if (!href && routeName) {
            href = this._getRouteStore().makePath(routeName, props.navParams);
        }
        if (!href) {
            throw new Error('NavLink created without href or unresolvable routeName \'' + routeName + '\'');
        }
        return href;
    },
    dispatchNavAction: function (e) {
        debug('dispatchNavAction: action=NAVIGATE', this.props.href, this.props.followLink, this.props.navParams);

        if (this.props.followLink) {
            return;
        }

        if (isModifiedEvent(e) || !isLeftClickEvent(e)) {
            // this is a click with a modifier or not a left-click
            // let browser handle it natively
            return;
        }

        var href = this.state.href;

        if (href[0] === '#') {
            // this is a hash link url for page's internal links.
            // Do not trigger navigate action. Let browser handle it natively.
            return;
        }

        if (href[0] !== '/') {
            // this is not a relative url. check for external urls.
            var location = window.location;
            var origin = location.origin || (location.protocol + '//' + location.host);

            if (href.indexOf(origin) !== 0) {
                // this is an external url, do not trigger navigate action.
                // let browser handle it natively.
                return;
            }

            href = href.substring(origin.length) || '/';
        }

        var context = this.props.context || this.context;
        e.preventDefault();
        context.executeAction(navigateAction, {
            type: 'click',
            url: href,
            params: this.props.navParams
        });
    },
    render: function() {
        var children = null;
        if (this.props.children) {
            if ('string' === typeof this.props.children) {
                children = this.props.children;
            } else {
                children = React.addons.cloneWithProps(this.props.children, {
                    isActive: this.state.isActive
                });
            }
        }
        return React.createElement(
            'a',
            objectAssign({}, {
                onClick: this.dispatchNavAction
            }, this.props, {
                href: this.state.href,
                className: this.state.isActive ? this.props.activeClass || 'active' : '',
                style: this.state.isActive ? this.props.activeStyle : {}
            }),
            children
        );
    }
});

module.exports = NavLink;
