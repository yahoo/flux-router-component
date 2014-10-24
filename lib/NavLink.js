/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react/addons'),
    NavLink,
    navigateAction = require('../actions/navigate'),
    debug = require('debug')('NavLink'),
    parseUrl = require('./parseUrl');

NavLink = React.createClass({
    propTypes: {
      context: React.PropTypes.object.isRequired
    },
    dispatchNavAction: function (e) {
        var context = this.props.context;
        debug('dispatchNavAction: action=NAVIGATE path=' + this.props.href + ' params=' + JSON.stringify(this.props.navParams));
        if (context) {
            e.preventDefault();
            var urlParts = parseUrl(this.props.href);
            context.executeAction(navigateAction, {
                type: 'click',
                path: urlParts && urlParts.pathname,
                url: this.props.href,
                params: this.props.navParams
            });
        } else {
            console.warn('NavLink.dispatchNavAction: missing dispatcher, will load from server');
        }
    },
    render: function() {
        var context = this.props.context;
        var routeName = this.props.routeName || this.props.name;
        if (!this.props.href && routeName && context && context.makePath) {
            this.props.href = context.makePath(routeName, this.props.navParams);
        }
        return this.transferPropsTo(
            React.DOM.a(
                {onClick:this.dispatchNavAction, href:this.props.href},
                this.props.children
            )
        );
    }
});

module.exports = NavLink;
