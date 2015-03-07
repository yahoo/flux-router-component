# fluxible-router

[![npm version](https://badge.fury.io/js/fluxible-router.svg)](http://badge.fury.io/js/fluxible-router)
[![Build Status](https://travis-ci.org/yahoo/fluxible-router.svg?branch=master)](https://travis-ci.org/yahoo/fluxible-router)
[![Dependency Status](https://david-dm.org/yahoo/fluxible-router.svg)](https://david-dm.org/yahoo/fluxible-router)
[![devDependency Status](https://david-dm.org/yahoo/fluxible-router/dev-status.svg)](https://david-dm.org/yahoo/fluxible-router#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yahoo/fluxible-router/badge.png?branch=master)](https://coveralls.io/r/yahoo/fluxible-router?branch=master)

This package provides routing for applications built with [Fluxible](https://github.com/yahoo/fluxible).

## Setup

`npm install --save fluxible-router`

### Register a Route Store

The library has a built-in `RouteStore` that needs to be registered to your application:

```js
// app.js
var FluxibleApp = require('fluxible');
var RouteStore = require('fluxible-router').RouteStore;
var app = new FluxibleApp({
    appComponent: require('./components/App.jsx')
});

app.registerStore(RouteStore.withStaticRoutes(require('./configs/routes'));

module.exports = app;
```

### Add Route Config

Route paths follow the same rules as [path-to-regexp](https://github.com/pillarjs/path-to-regexp) library.

```js
// configs/routes.js
module.exports = {
    home: {
        method: 'GET',
        path: '/',
        handler: require('../components/Home.jsx'),
        // Executed on route match
        action: require('../actions/loadHome')
    },
    about: {
        method: 'GET',
        path: '/about',
        handler: require('../components/About.jsx')
    },
    user: {
        method: 'GET',
        path: '/user/:id',
        handler: require('../components/User.jsx')
    }
};
```

### Call the Navigate Action

On the server (or client in client-only apps) where you handle the initial request, call the navigate action with the request url:

```js
// server.js
var app = require('./app');
var navigateAction = require('fluxible-router').navigateAction;

...
    var context = app.createContext();
    context.executeAction(navigateAction, {
        url: url // e.g. req.url
    }, function (err) {
        var html = React.renderToString(context.createElement());
        res.write(html);
        res.end();
    });
...
```

### Use it in your components

```js
// components/App.jsx
var FluxibleMixin = require('fluxible').FluxibleMixin;
var RouterMixin = require('fluxible-router').RouterMixin;
var NavLink = require('fluxible-router').NavLink;
module.exports = React.createClass({
    // The RouterMixin should be mixed in to your top level component
    // The router mixin handles changing the window pushState when a navigate happens
    mixins: [FluxibleMixin, RouterMixin],
    render: function () {
        // Get the handler form the current route
        var Handler = this.getCurrentRoute().handler;
        return (<div>
            <ul>
                // Create client handled links using NavLink anywhere in your application
                // activeStyle will apply the styles when it's the current route
                <li><NavLink href='/home' activeStyle={{backgroundColor: '#ccc'}}>Home</NavLink></li>
                // RouteName will build the href from the route with the same name
                // Active class will apply the class when it's the current route
                <li><NavLink routeName='about' activeClass='selected'>About</NavLink></li>
                // You can also add parameters to your route if it's a dynamic route
                <li><NavLink routeName='user' navParams={{id: 1}}>User 1</NavLink></li>
            </ul>
            <Handler />
        </div>)
    }
});
```

## History Management (Browser Support and Hash-Based Routing)

Considering different application needs and [different browser support levels for pushState](http://caniuse.com/#search=pushstate), this library provides the following options for browser history management:

* Use `History` provided by this library (Default)
* Use `HistoryWithHash` provided by this library
* In addition, you can also customize it to use your own

### History

This is the default `History` implementation `RouterMixin` uses.  It is a straight-forward implementation that:
* uses `pushState`/`replaceState` when they are available in the browser.
* For the browsers without pushState support, `History` simply refreshes the page by setting `window.location.href = url` for `pushState`, and calling `window.location.replace(url)` for `replaceState`.

### HistoryWithHash

Using hash-based url for client side routing has a lot of known issues.  [History.js describes those issues pretty well](https://github.com/browserstate/history.js/wiki/Intelligent-State-Handling).

But as always, there will be some applications out there that have to use it.  This implementation provides a solution.

If you do decide to use hash route, it is recommended to enable `checkRouteOnPageLoad`.  Because hash fragment (that contains route) does not get sent to the server side, `RouterMixin` will compare the route info from server and route in the hash fragment.  On route mismatch, it will dispatch a navigate action on browser side to load the actual page content for the route represented by the hash fragment.

#### useHashRoute Config

You can decide when to use hash-based routing through the `useHashRoute` option:

* `useHashRoute=true` to force to use hash routing for all browsers, by setting `useHashRoute` to true when creating the `HistoryWithHash` instance;
* `unspecified`, i.e. omitting the setting, to only use hash route for browsers without native pushState support;
* `useHashRoute=false` to turn off hash routing for all browsers.

|  | useHashRoute = true | useHashRoute = false | useHashRoute unspecified |
|--------------------------------------|-------------------------------------------------|---------------------------------------|--------------------------------|
| Browsers *with* pushState support | history.pushState with /home#/path/to/pageB | history.pushState with /path/to/pageB | Same as `useHashRoute = false` |
| Browsers *without* pushState support | page refresh to /home#/path/to/pageB | page refresh to /path/to/pageB | Same as `useHashRoute = true` |

#### Custom Transformer for Hash Fragment

By default, the hash fragments are just url paths.  With `HistoryWithHash`, you can transform it to whatever syntax you need by passing `props.hashRouteTransformer` to the base React component that `RouterMixin` is mixed into.  See the example below for how to configure it.

#### Example

This is an example of how you can use and configure `HistoryWithHash`:

```js
var RouterMixin = require('fluxible-router').RouterMixin;
var HistoryWithHash = require('fluxible-router/utils').HistoryWithHash;

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});

var appComponent = Application({
    ...
    historyCreator: function historyCreator() {
        return new HistoryWithHash({
            // optional. Defaults to true if browser does not support pushState; false otherwise.
            useHashRoute: true,
            // optional. Defaults to '/'. Used when url has no hash fragment
            defaultHashRoute: '/default',
            // optional. Transformer for custom hash route syntax
            hashRouteTransformer: {
                transform: function (original) {
                    // transform url hash fragment from '/new/path' to 'new-path'
                    var transformed = original.replace('/', '-').replace(/^(\-+)/, '');
                    return transformed;
                },
                reverse: function (transformed) {
                    // reverse transform from 'new-path' to '/new/path'
                    var original = '/' + (transformed && transformed.replace('-', '/'));
                    return original;
                }
            }
        });
    }
});

```

### Provide Your Own History Manager

If none of the history managers provided in this library works for your application, you can also customize the RouterMixin to use your own history manager implementation.  Please follow the same API as `History`.

#### API

Please use `History.js` and `HistoryWithHash.js` as examples.

* on(listener)
* off(listener)
* getUrl()
* getState()
* pushState(state, title, url)
* replaceState(state, title, url)

#### Example:

```js
var RouterMixin = require('fluxible-router').RouterMixin;
var MyHistory = require('MyHistoryManagerIsAwesome');

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});

var appComponent = Application({
    ...
    historyCreator: function historyCreator() {
        return new MyHistory();
    }
});

```

## Scroll Position Management

`RouterMixin` has a built-in mechanism for managing scroll position upon page navigation, for modern browsers that support native history state:

* reset scroll position to `(0, 0)` when user clicks on a link and navigates to a new page, and
* restore scroll position to last visited state when user clicks forward and back buttons to navigate between pages.

If you want to disable this behavior, you can set `enableScroll` prop to `false` for `RouterMixin`.  This is an example of how it can be done:

```js
var RouterMixin = require('fluxible-router').RouterMixin;

var Application = React.createClass({
    mixins: [RouterMixin],
    ...
});

var appComponent = Application({
    ...
    enableScroll: false
});

```

## Polyfills
`addEventListener` and `removeEventListener` polyfills are provided by:

* Compatibility code example on [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener)
* A few DOM polyfill libaries listed on [Modernizer Polyfill wiki page](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#dom).

`Array.prototype.reduce` and `Array.prototype.map` (used by dependent library, query-string) polyfill examples are provided by:

* [Mozilla Developer Network Array.prototype.reduce polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill)
* [Mozilla Developer Network Array.prototype.map polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill)

You can also look into this [polyfill.io polyfill service](https://cdn.polyfill.io/v1/).

## Compatible React Versions

| Compatible React Version | flux-router-component Version |
|--------------------------|-------------------------------|
| 0.12 | >= 0.4.1 |
| 0.11 | < 0.4 |

## License
This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible-router/blob/master/LICENSE.md

Third-pary open source code used are listed in our [package.json file]( https://github.com/yahoo/fluxible-router/blob/master/package.json).
