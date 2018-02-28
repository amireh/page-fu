import sinon from 'sinon';
import { assert } from 'chai';
import page from 'page';
import FakeDOM from './FakeDOM';
export { default as assertChange } from 'chai-assert-change'

sinon.assert.expose(assert, { prefix: "" });

export { assert };
export function sinonSuite(mochaSuite, options = {}) {
  let api = {};
  let sandbox;

  mochaSuite.beforeEach(function() {
    sandbox = sinon.sandbox.create({
      injectInto: api,
      properties: [ 'stub', 'spy', 'server', 'requests', 'match', 'clock' ],
      useFakeServer: options.useFakeServer !== false,
      useFakeTimers: options.useFakeTimers !== false,
    });
  });

  mochaSuite.afterEach(function() {
    sandbox.restore();
  });

  return api;
}

export function simulateDOMEnvironment(mochaSuite, options) {
  mochaSuite.beforeEach(function() {
    Object.keys(FakeDOM).forEach(key => { global[key] = FakeDOM[key] });
  })

  const removeDOM = () => {
    Object.keys(FakeDOM).reverse().forEach(key => { delete global[key] });
  }

  if (!options || options.removeAutomatically !== false) {
    mochaSuite.afterEach(removeDOM);
  }
  else {
    return removeDOM;
  }
}

export function pageSuite(mochaSuite, { draw }) {
  let callbacks, exits;

  const removeDOM = simulateDOMEnvironment(mochaSuite, { removeAutomatically: false });

  mochaSuite.beforeEach(function() {
    callbacks = page.callbacks;
    exits = page.exits;

    page.callbacks = [];
    page.exits = [];
    page('/__hadouken__', () => {});

    draw();

    page.start({ dispatch: false, hashbang: true });
    page('/__hadouken__');
  })

  afterEach(function() {
    page('/__hadouken__');
    page.stop();
    page.callbacks = callbacks;
    page.exits = exits;
  });

  removeDOM();

  return page;
}