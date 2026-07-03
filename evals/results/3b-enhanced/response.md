**Root cause: the session-validity check is inverted — `server.js:16`.**

```js
function isSessionValid(session, now = Date.now()) {
  return now - session.createdAt > SESSION_TTL_MS;   // line 16
}
```

A session should be valid while its age is *under* the TTL (`now - createdAt < SESSION_TTL_MS`). This function returns the opposite: it returns `true` only when the session is **older** than 30 minutes. So every freshly created session is judged invalid, and only already-expired sessions would pass.

**Failing scenario, concretely:**

1. User POSTs `/login` with valid credentials → `createSession` (`server.js:9-13`) stores `{username, createdAt: Date.now()}` and returns a token. Login succeeds.
2. The client immediately calls `GET /me` with that token. At `server.js:52`, `isSessionValid(session)` computes `now - createdAt` ≈ a few milliseconds, which is **not** `> 30 min`, so it returns `false`.
3. The `!isSessionValid(session)` branch fires → `401 {"error":"session expired"}` (`server.js:53-54`). The client treats the 401 as a dead session and logs the user out — exactly the "logged out right after logging in" complaint.

Perversely, the token would start "working" only after 30 minutes — the exact inverse of intended TTL behavior.

**Reproduced live** (ran the server, logged in, called `/me` in the same second):

```
login token: b33c479403016a4abfafd20a31bed492
GET /me right after login:
HTTP/1.1 401 Unauthorized
```

The fix (not applied, per your boundary) is flipping the comparison on line 16 to `now - session.createdAt < SESSION_TTL_MS`.

One secondary observation, not the reported bug: `server.js:39` (`USERS.get(body.username) === body.password`) is a non-constant-time comparison of a plaintext password — fine for an eval fixture, worth noting if this pattern ever leaves it.
