import page from 'page';
import Router from './Router';
import Route from './Route';

/**
 * @module page-fu
 * @preserveOrder
 *
 * The package exports.
 *
 * ### How to use
 *
 * If you're new to ES6 modules and packages, here's all you need to know to
 * learn how to use the package (and this reference):
 *
 * Every "symbol" that is listed in this reference is an "export" of the package
 * which you can then import using the `import` statement. For example, to pull
 * in the `Route`, `start` and `stop` symbols:
 *
 *     import { Route, start, stop } from 'page-fu';
 *
 * That's it! You can now call `start()`, `stop()` and `Route()` or press ALT+F4.
 */

/**
 * @property {Router} Router
 */
export { Router };

/**
 * @property {Route} Route
 */
export { Route };

/**
 * Start the router.
 *
 * @param {Object} options
 *        [page.js start()](https://visionmedia.github.io/page.js/#pageoptions)
 *        options.
 */
export function start(options) {
  page.start(options);
}

/**
 * Stop the router. Any calls to routing methods beyond this stage will be
 * ignored.
 */
export function stop() {
  page.stop();
}

/**
 * @type {Function}
 *
 * Forwards to [[Router.redirectTo]]
 */
export const redirectTo = forwardToRouter('redirectTo');

/**
 * @type {Function}
 * Forwards to [[Router.replaceQuery]]
 */
export const replaceQuery = forwardToRouter('replaceQuery');

/**
 * @type {Function}
 *
 * Forwards to [[Router.transitionTo]]
 */
export const transitionTo = forwardToRouter('transitionTo');

/**
 * @type {Function}
 *
 * Forwards to [[Router.updateQuery]]
 */
export const updateQuery = forwardToRouter('updateQuery');

/** @property {withFirstClassMethods} */
export { default as withFirstClassMethods } from './withFirstClassMethods';

/** @property {withProps} */
export { default as withProps } from './withProps';

/** @property {withState} */
export { default as withState, StateTransaction } from './withState';

/** @property {withRoutingAPIs} */
export { default as withRoutingAPIs } from './withRoutingAPIs';

/** @property {withAtomicity} */
export { default as withAtomicity } from './withAtomicity';

/** @property {withHooks} */
export { default as withHooks } from './withHooks';

function forwardToRouter(fnName) {
  return function() {
    return Router[fnName].apply(null, arguments);
  }
}