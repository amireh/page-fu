import ensureNextIsCalled from './ensureNextIsCalled';

/**
 * @preserveOrder
 *
 * Decorate your route with the ability to transition between (internal) states.
 * That state will be purged upon entering and exiting the route so you do not
 * need to manage it.
 *
 * Here's an example that tracks an internal counter and outputs it to the
 * console when it changes:
 *
 *     import { withState } from 'page-fu';
 *
 *     export default withState({
 *       getInitialState() {
 *         return { value: 0 };
 *       },
 *
 *       enter() {
 *         this.renderValue(); // => "Value = 0"
 *         this.increment();
 *       },
 *
 *       stateDidChange() {
 *         this.renderValue(); // => "Value = 1"
 *       },
 *
 *       renderValue() {
 *         console.log('Value = %d', this.state.value)
 *       },
 *
 *       increment() {
 *         this.setState({
 *           value: this.state.value + 1
 *         });
 *       }
 *     })
 *
 * @param {Route} instance
 * @return {Route}
 */
export default function withState(instance) {
  const { enter = Function.prototype } = instance;
  const exit = ensureNextIsCalled(instance.exit);

  return Object.assign({}, instance, {

    enter(ctx, next) {
      this.state = this.getInitialState() || {};
      this.__stateTransaction = null;

      enter.call(this, ctx, next);
    },

    exit(ctx, next) {
      exit.call(this, ctx, err => {
        this.__stateTransaction = null;
        this.state = this.getInitialState() || {};

        next(err);
      });
    },

    /**
     * @property {Object}
     *
     * The route's internal state which can be mutated using the state routines.
     */
    state: null,

    /**
     * @method
     *
     * A producer for the initial state the container should start in. The
     * output of this method will be used when clearing the container as well.
     *
     * @return {Object}
     *         The initial state definition.
     */
    getInitialState: instance.getInitialState || Function.prototype,

    /**
     * Transition to a new state, overwriting any existing keys.
     *
     * @param {Object} partialState
     */
    setState(partialState) {
      setState(this, Object.assign({}, this.state, partialState));
    },

    /**
     * Transition to an entirely new state, replacing the old one.
     *
     * @param  {Object} newState
     */
    replaceState(newState) {
      setState(this, newState);
    },

    /**
     * Reset the state.
     */
    clearState() {
      setState(this, this.getInitialState() || {});
    },

    /**
     * @method
     *
     * A hook that is invoked when the state changes through calls to
     * [[#setState]], [[#replaceState]] or [[#clearState]].
     *
     * @param {Object} prevState
     */
    stateDidChange: instance.stateDidChange || Function.prototype,
  })
};

function setState(route, nextState) {
  if (route.__stateTransaction) {
    route.__stateTransaction.push(nextState)
  }
  else {
    applyStateTransition(route, nextState)
  }
}

function applyStateTransition(route, nextState) {
  const prevState = route.state

  route.state = nextState
  route.stateDidChange(prevState)
}

/**
 * Freeze the state and all changes to it throughout a function. All calls to
 * [[#setState]] and [[#replaceState]] will be buffered until the function
 * returns, at which point they will be "replayed" but cause only one change
 * to be triggered ([[#stateDidChange]].)
 *
 * @param {Route} route
 * @param {Function} f
 */
export function StateTransaction(route, f) {
  const reset = () => {
    route.__stateTransaction = null;
  }

  let called

  route.__stateTransaction = []

  try {
    f(route.state)
  }
  catch (e) {
    reset()

    throw e;
  }

  const transaction = route.__stateTransaction

  called = transaction.length > 0

  reset()

  if (called) {
    const nextState = transaction.reduce(function(acc, stateChange) {
      return Object.assign({}, acc, stateChange)
    }, {})

    applyStateTransition(route, nextState)
  }
}