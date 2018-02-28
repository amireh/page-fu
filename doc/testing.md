# Testing

Testing routes at the unit-level should be possible and page-fu defines the
handlers in a way that makes them testable even _without_ page.js actually
running (assuming, of course, that you will be stubbing calls to the routing
APIs.)

There is very little "cruft" needed to define your tests. Namely, you will only
need to provide a [routing
context](https://visionmedia.github.io/page.js/#context) for the route and call
`enter` or `exit` as needed.

Let us go through a few examples to see how we can test various aspects of our
route handlers.

## Testing the `enter` and `exit` hooks

In this example, the route will be fetching a user upon entering and we'll
verify that it's making the correct call as well as using the data once it
arrives.

For this test, we'll assume [sinon](http://sinonjs.org/) to be available to
mock the requests, and an API called `fetch` that performs an XHR and yields
JSON.

```javascript
// UserRoute.js
import { Route } from 'page-fu';

export default Route({
  getInitialState() {
    return { user: null }
  },

  enter() {
    const { userId } = this.props.params;

    fetch(`/api/users/${userId}`).then(user => {
      this.setState({ user })
      this.render()
    });

    this.render()
  },

  render() {
    if (this.state.user) {
      console.log(this.state.user.name);     
    }
  }
})
```

Now for our test, we only need to call `enter` with some [page.js
context](https://visionmedia.github.io/page.js/#context) which will get
processed by our route's decorators.

```javascript
// UserRoute.test.js
import subject from './UserRoute';
import sinon from '...';
import assert from '...';

describe('UserRoute.enter', function() {
  afterEach(function(done) {
    subject.exit({}, done)
  });
  
  it('fetches the user pointed to by params', function() {
    subject.enter({
      params: {
        userId: 'user1'
      }
    });

    assert.equal(sinon.server.requests.length, 1);
    assert.equal(sinon.server.requests[0].url, '/api/users/user1');
  });

  it('renders the user', function() {
    sinon.stub(console, 'log');

    subject.enter({
      params: {
        userId: 'user1'
      }
    });

    sinon.server.requests[0].respond([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ name: 'The Banana King' })
    ])

    assert.calledWith(console.log, 'The Banana King');
  });
})
```

Testing the `exit` hook is similar but you should probably call `enter` first
to simulate the real state the route will normally be in when `exit` is called.

## Testing public APIs

This is also straight-forward except that you should call `enter` to prepare
your route (that is, to apply the various decorators' entry hooks.)

Consider the following route which defines a `parseFile` API that gets called
by the UI somewhere:

```javascript
// file: MyRoute.js
import { Route } from 'page-fu';

export default Route({
  parseFile(file) {
    this.setState({ parsing: true });

    // do something with file...
    doSomethingWithFile(file).then(() => {
      if (this.isActive()) {
        this.setState({ parsing: false });
      }
    })
  },

  isParsingFile() {
    return this.state.parsing;
  }
})
```

```javascript
// file: MyRoute.test.js
import subject from './MyRoute';
import { assert } from 'chai';

describe('MyRoute.parseFile', function() {
  afterEach(function(done) {
    subject.exit({}, done)
  });

  it('works', function() {
    // must initialize the route by invoking the decorators' entry hooks
    subject.enter({});

    // now the route is ready to be interacted with
    subject.parseFile(someFile);

    assert.ok(subject.isParsingFile())
  })
})
```

## Testing transitions

There's nothing special here since the routes will be invoking [[instance
methods | withRoutingAPIs]] to perform routing side-effects so you would
test them like any other API.

For example, to verify that the following route will perform a redirect in case
the user is or is not authorized:

```javascript
// file: LandingRoute.js
import { Route } from 'page-fu';

export default Route({
  enter() {
    if (this.isAuthorized()) {
      this.redirectTo('/dashboard');
    }
    else {
      this.redirectTo('/login');
    }
  },

  isAuthorized() {
    // ...
  }
})

// file: LandingRoute.test.js
import subject from './LandingRoute';

describe('LandingRoute', function() {
  it('redirects to "/dashboard" if user is logged in', function() {
    sinon.stub(subject, 'isAuthorized', () => true);
    sinon.stub(subject, 'redirectTo');

    subject.enter();

    assert.calledWith(subject.redirectTo, '/dashboard');
  })
})
```

### Testing