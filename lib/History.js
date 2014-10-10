/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var relativePathRegex = /^(?:\/\/|[^\/]+)*\/?/;

function getRelativePath(url) {
    return url && url.replace(relativePathRegex, '/');
}

/**
 * @class History
 * @constructor
 * @param {Window} [win=window]  The window object
 */
function History(win) {
    // check browser support conditions. Support IE8+
    this.win = win || window;
    this._hasPushState = !!(this.win && this.win.history && this.win.history.pushState);
}

History.prototype = {
    /**
     * Add the given listener for 'popstate' event
     * @method on
     * @param {Function} listener
     */
    on: function (listener) {
        this.win.addEventListener('popstate', listener);
    },

    /**
     * Remove the given listener for 'popstate' event
     * @method off
     * @param {Function} listener
     */
    off: function (listener) {
        this.win.removeEventListener('popstate', listener);
    },

    /**
     * Gets the path string
     * @method getPath
     * @return {String} The path string that denotes current route path
     */
    getPath: function () {
        return this.win.location.pathname;
    },

    /**
     * Whether pushState is supported.
     * @method hasPushState
     * @return {Boolean} true if native support is found; false otherwise.
     */
    hasPushState: function () {
        return this._hasPushState;
    },

    /**
     * Same as HTML5 pushState API
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
        this.win.history[replace ? 'replaceState' : 'pushState'](state, title, url);
    }
};

module.exports = History;
