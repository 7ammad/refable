**Root cause: inverted TTL comparison in `isSessionValid` — `server.js:16`.** It returned `now - createdAt > SESSION_TTL_MS`, i.e. a session counted as valid only *after* it aged past the 30-minute TTL. Every fresh session failed the check, so `/me` returned 401 "session expired" immediately after login — exactly the reported symptom. Fix is one character: `>` → `<`. Only the auth/session path was touched (that one line), plus a new `test-session.js` repro.

**Before the fix** (`node test-session.js`):
```
AssertionError [ERR_ASSERTION]: FAIL: session 1s after login is treated as expired (users logged out right after logging in)
false !== true
    at Object.<anonymous> ...test-session.js:9:8
exit=1
```

**After the fix** (same command):
```
e2e: login -> /me = 200 {"username":"demo"}
ALL TESTS PASSED
exit=0
```

The test has teeth in both directions: it went red on the bug and green on the fix, covers the mid-session case (just under TTL → valid), and asserts real expiry still works (past TTL → invalid, so the fix didn't just make everything valid). The e2e leg runs the actual server and reproduces the user flow — login, then `/me` with the returned token — now 200 where it was 401.
