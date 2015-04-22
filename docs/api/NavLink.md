# NavLink

`NavLink` is the a React component for navigational links.  When the link is clicked, NavLink will execute a [navigateAction](./navigateAction.md).  Stores can register for `CHANGE_ROUTE_SUCCESS` handlers if they are interested
in navigation events.

## Component Props

| Prop Name | Prop Type | Description |
|-----------|-----------|-------------|
| href | String | The url string |
| routeName | String | Not used if `href` is specified. This is the name of the target route, which should be defined in your app's routes. |
| navParams | Object | If `href` prop is not available, `navParams` object will be used together with `routeName` to generate the href for the link.  This object needs to contain route params the route path needs.  Eg. for a route path `/article/:id`, `navParams.id` will be the article ID. |
| followLink | boolean, default to false | If set to true, client side navigation will be disabled.  NavLink will just act like a regular anchor link. |
| replaceState | boolean, default to false | If set to true, replaceState is being used instead of pushState |
| preserveScrollPosition | boolean, default to false | If set to true, the page will maintain its scroll position on route change. |


## Example Usage

Here are two examples of generating `NavLink` using `href` property, and using `routeName` property.  Using `href` property is better than using `routeName`, because:

* Using `href` makes your code more readible, as it shows exactly how the `href` is generated.
* Using `routeName` allows generating the `href` from the `routeName` and `navParams` props. Does not support querystring or hash fragment.

```js
var NavLink = require('fluxible-router').NavLink;

var MyComponent = React.createClass({
    render: function () {
        return (
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
        );
    }
});

module.exports = MyComponent;
```
