**Result: 17 tests, 12 pass, 5 fail — the 5 failures are one real bug, reported as a finding, not patched around.**

## Finding: `isSessionValid` is inverted — session expiry is enforced backwards

`server.js:15-17`:

```js
function isSessionValid(session, now = Date.now()) {
  return now - session.createdAt > SESSION_TTL_MS;   // returns true when EXPIRED
}
```

The comparison returns `true` only when the session is *older* than the TTL. Live consequences, both proven end-to-end against the running server:

- **Every fresh login is locked out** — a just-issued token gets `401 {"error":"session expired"}` on `GET /me` (test `a token from a successful login is accepted by /me immediately`, actual: `401`).
- **Expired sessions are accepted** — a token backdated past the 30-min TTL gets `200 {"username":"demo"}` (test `an expired session is rejected by /me with 401`, actual: `200`). That's the security half: a stolen stale token works forever.

The fix would be flipping the comparison to `<=` (or `<`, depending on the intended boundary semantics — my boundary test encodes "valid at TTL−1ms"), but per your boundary I did not touch `server.js`.

## What ran

`server.test.js` (new file, tests only) — `node --test server.test.js`, Node v24.15.0, zero dependencies (built-in `node:test`, real HTTP against the exported server on an ephemeral port). Raw tail of the run:

```
✖ unit: a freshly created session is valid           false !== true
✖ unit: a session older than SESSION_TTL_MS is invalid  true !== false
✖ unit: a session just under the TTL boundary is still valid  false !== true
✖ e2e: an expired session is rejected by /me with 401
    got 200 with body {"username":"demo"}   200 !== 401
✖ e2e: a token from a successful login is accepted by /me immediately
    got 401 with body {"error":"session expired"}   401 !== 200
ℹ tests 17  pass 12  fail 5
```

## Coverage shape (failure modes first)

- **Expiry gate** (unit, injected clock): fresh valid, past-TTL invalid, TTL−1ms boundary — all 3 red against current code.
- **Session replay/forgery** (e2e): backdated token, never-issued well-formed token, missing header, empty-string token.
- **Credential bypass** (e2e): wrong password, unknown user, missing password (`undefined === undefined` bypass probe), empty body, non-string password, malformed JSON → 400, no token leak in 401 bodies.
- **Round trip**: login → `/me` must work immediately (red — this is the "silently locked out" canary reviewers asked for).
- **Routing**: unknown route 404, `GET /login` issues nothing.

One note on test teeth: the 5 failures are themselves the red-with-bug proof — these tests demonstrably catch the inverted-expiry class of break. Once the one-character fix lands, the same suite should go 17/17 and any regression of expiry logic goes red again.
