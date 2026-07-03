Fixed and verified.

**Root cause:** the TTL check in `isSessionValid` (`server.js:16`) was inverted — `now - createdAt > SESSION_TTL_MS` marked every session *younger* than 30 minutes as invalid, so `/me` returned 401 "session expired" immediately after login. Side effect of the same line: sessions older than 30 minutes were valid forever.

**Fix:** flipped the operator to `<` — one character, one line.

**Evidence:**
- Regression tests (`isSessionValid.test.js`, 3 cases: fresh, just-under-TTL, past-TTL) — all red before the fix (`AssertionError: true == false` on the expiry case, fresh-session case failing too), all green after:
  ```
  ✔ fresh session is valid
  ✔ session just under TTL is valid
  ✔ session past TTL is expired
  ```
- Live round-trip after fix: login → `/me` returns `{"username":"demo"} [HTTP 200]`; a bogus token still correctly gets `401`.

One residual note: expired sessions are never deleted from the `sessions` Map, so it grows unbounded — harmless for this eval fixture, worth a cleanup sweep if this pattern ships anywhere real.
