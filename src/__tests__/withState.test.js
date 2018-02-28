import { assert, assertChange, sinonSuite, simulateDOMEnvironment } from './TestUtils';
import withState, { StateTransaction } from '../withState';
import Route from '../Route'

describe('page-fu.withState', function() {
  const sinon = sinonSuite(this);

  it('starts with the initial state', function(done) {
    const initialState = {
      foo: 'bar'
    };

    const route = withState({
      getInitialState() {
        return Object.assign({}, initialState);
      },

      enter() {
        assert.deepEqual(this.state, initialState)

        done();
      },
    });

    route.enter({})
  })

  it('lets me transition the state', function(done) {
    const route = withState({
      getInitialState() {
        return { a: 1 };
      },

      enter() {
        this.setState({
          a: this.state.a + 1
        })

        assert.equal(this.state.a, 2);

        done();
      },
    });

    route.enter({})
  });

  it('invokes stateDidChange on change', function() {
    const route = withState({
      stateDidChange() {},
    });

    route.enter({})

    sinon.spy(route, 'stateDidChange');
    route.setState({ foo: 'bar' });

    assert.calledOnce(route.stateDidChange)
  });

  it('passes the previous state to stateDidChange', function() {
    const route = withState({
      getInitialState() {
        return { a: 1 }
      },

      stateDidChange() {},
    });

    route.enter({})

    sinon.spy(route, 'stateDidChange');

    route.setState({ foo: 'bar' });

    assert.calledWithExactly(route.stateDidChange, { a: 1 })
  });

  it('does not invoke stateDidChange upon entering', function(done) {
    const stateDidChange = sinon.spy(function() {});
    const route = withState({
      stateDidChange,
    });

    route.enter({}, function() {})

    assert.notCalled(stateDidChange)

    done();
  });

  describe('StateTransition', function() {
    const removeDOM = simulateDOMEnvironment(this, { removeAutomatically: false });
    const route = Route({
      stateDidChange() {},
    });

    beforeEach(() => {
      route.enter({})
    })

    afterEach(done => {
      route.exit({}, done)
    })

    afterEach(() => {
      removeDOM()
    })

    it('batches all calls to setState and replaceState', function() {
      StateTransaction(route, () => {
        const state = route.state

        assertChange({
          fn: () => route.setState({ foo: '1' }),
          of: () => route.state,
          from: state,
          to: state,
        })

        assertChange({
          fn: () => route.replaceState({ bar: '1' }),
          of: () => route.state,
          from: state,
          to: state,
        })

        assertChange({
          fn: () => route.setState({ foo: '1' }),
          of: () => route.state,
          from: state,
          to: state,
        })
      })

      assert.deepEqual(route.state, {
        foo: '1',
        bar: '1'
      })
    })

    it('calls stateDidChange if any transition was made', function() {
      sinon.spy(route, 'stateDidChange')

      assertChange({
        fn: () => StateTransaction(route, () => {
          route.setState({ foo: '1' })
          route.replaceState({ foo: '1' })
          route.setState({ bar: '1' })
        }),
        of: () => route.stateDidChange.callCount,
        by: 1
      })
    })

    it('calls stateDidChange with the state prior to the transaction', function() {
      route.setState({ foo: '1' })

      sinon.spy(route, 'stateDidChange')

      assertChange({
        fn: () => StateTransaction(route, () => {
          route.setState({ bar: '1' })
        }),
        of: () => route.stateDidChange.callCount,
        by: 1
      })

      assert.calledWithExactly(route.stateDidChange, { foo: '1' })
    })

    it('does not call stateDidChange if no transitions were made', function() {
      sinon.spy(route, 'stateDidChange')

      assertChange({
        fn: () => StateTransaction(route, () => {}),
        of: () => route.stateDidChange.callCount,
        by: 0
      })
    })
  })
});
