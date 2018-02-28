## 2.0.0

- `withState` now passes the previous state to the `stateDidChange` hook
- `StateTransaction` is a new facility for ensuring that the state remains
  frozen throughout the block and any calls to `stateDidChange` are buffered

## 1.0.3

- `withProps` now uses `ctx.querystring` for the initial query parameter
  values. This change is necessary to reflect query strings found in
  internal page transitions (prior to `location` being modified by page.js)

## 1.0.2

- `withProps` is now idempotent to prevent it from throwing errors itself
  if the next `enter` raises an exception
- Fixed a bug where `withState` would trigger `stateDidChange` on exit

## 1.0.1

- Use `HTMLElement#createEvent` to trigger the internal query event for IE11
  compatibility.

## 1.0.0

Initial release!