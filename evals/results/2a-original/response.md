**Tests written and they caught a real bug on first run.** 16/16 now pass.

- `server.test.js` — 16 tests via built-in `node:test` (no deps added): 4 pure-unit tests of `isSessionValid` with injected clock (fresh / just-under-TTL / exactly-TTL / past-TTL), 12 HTTP round-trips against the real server on an ephemeral port (login happy path, wrong password, unknown user, missing password guarding the `undefined === undefined` trap, empty password, malformed JSON, empty body, full login→`/me` flow, missing/unknown/expired token, 404 route).

**The bug:** `server.js:16` had the TTL comparison inverted — `now - createdAt > SESSION_TTL_MS` returned *true* for expired sessions, so every fresh token got 401 on `/me` and expired tokens passed. First run: 5 failures, all traceable to that line (`401 !== 200` on the login→`/me` flow, `200 !== 401` on the expired-session test — raw output above). Flipped `>` to `<` (valid strictly under TTL; exactly-TTL treated as expired — encoded in the boundary test). Re-run: `pass 16, fail 0`.

Red-with-bug → green-with-fix is the proof the suite has teeth — these aren't assertions written to match the code, they encode the README's documented behavior and failed against the implementation until it was corrected.
