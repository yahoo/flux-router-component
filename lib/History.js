/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var parseUrl = require('./parseUrl');

/**
 * @class History
 * @constructor
 * @param {Window} [win=window]  The window object
 */
function History(win) {
    // check browser support conditions. Support IE8+
    this.win = win || window;
    this._hasPushState = !!(this.win && this.win.history && this.win.history.pushState);
    this._popstateEvt = this._hasPushState ? 'popstate' : 'hashchange';
}

History.prototype = {
    /**
     * Add the given listener for 'popstate' event (fall backs to 'hashchange' event
     * for browsers don't support popstate event).
     * @method on
     * @param {Function} listener
     */
    on: function (listener) {
        this.win.addEventListener(this._popstateEvt, listener);
    },

    /**
     * Remove the given listener for 'popstate' event (fall backs to 'hashchange' event
     * for browsers don't support popstate event).
     * @method off
     * @param {Function} listener
     */
    off: function (listener) {
        this.win.removeEventListener(this._popstateEvt, listener);
    },

    /**
     * Returns the hash fragment in current window location.
     * @method getHash
     * @return {String} The hash fragment string (without the # prefix).
     */
    getHash: function () {
        var hash = this.win.location.hash || '';
        // remove the '#' prefix
        return hash.substring(1) || '';
    },

    /**
     * Gets the path string (or hash fragment for old browsers that don't support pushState).
     * @method getPath
     * @return {String} The path string that denotes current route path
     */
    getPath: function () {
        var path = this.win.location.pathname,
            hash;
        if (!this._hasPushState && (hash = this.getHash())) {
            return hash;
        }
        return path;
    },

    /**
     * Returns the relative url in current window location.
     * @method getRelativeUrl
     * @return {String} The url string.
     */
    getRelativeUrl: function () {
        if (this._hasPushState) {
            return this.win.location.pathname + this.win.location.search + this.win.location.hash;
        } else {
            var path = this.getHash();
            if (path[0] !== '/') {
                path = '/' + path;
            }
            return path + this.win.location.search;
        }
    },

    /**
     * Whether pushState is natively supported.
     * @method hasPushState
     * @return {Boolean} true if native support is found; false otherwise.
     */
    hasPushState: function () {
        return this._hasPushState;
    },

    /**
     * Same as HTML5 pushState API, but with old browser support
     * @method pushState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    pushState: function (state, title, url) {
        this._updateState(state, title, url, false);
    },

    /**
     * Same as HTML5 replaceState API, but with old browser support
     * @method replaceState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    replaceState: function (state, title, url) {
        this._updateState(state, title, url, true);
    },

    /**
     * push or replace the history state, with old browser support
     * @method _updateState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     * @param {Boolean} replace Whether to replace browser state
     * @private
     */
    _updateState: function (state, title, url, replace) {
        var self = this;
        if (self._hasPushState) {
            var method = replace ? 'replaceState' : 'pushState';
            self.win.history[method](state, title, url);
        } else {
            // no pushstate support, use hash
            self._updateHash(state, title, url, replace);
        }
    },

    /**
     * update hash fragment, used in old browser
     * @method _updateHash
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     * @param {Boolean} replace Whether to replace browser state
     * @private
     */
    _updateHash: function (state, title, url, replace) {
        // url is the normalized page url, from the IE8 hash notation
        // e.g.
        //  actual window.location.href is: http://somedomain.com/some_ignored_path?a=1#/path/to/pageA
        //  url passed in is: /path/to/pageB?b=2 or http://somedomain.com/path/to/pageB?b=2
        //  =>
        // The after update, the window location href would be:
        //   http://somedomain.com/some_path?b=2#/path/to/pageB
        var urlParts = parseUrl(url) || {},
            location = this.win.location,
            href;
        if (urlParts.pathname) {
            href = location.protocol + '//' + location.host + location.pathname;
            if (urlParts.search !== '?') {
                href += urlParts.search;
            }
            href += '#' + urlParts.pathname;
            if (replace) {
                location.replace(href);
            } else {
                location.href = href;
            }
        }
    }
};

module.exports = History;
