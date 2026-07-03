# Eval results — 2026-07-02

7 headless runs (`claude -p --model fable`, fresh fixture copy per run, git-tracked diffs). Fixture: a tiny auth service with one planted bug — an inverted TTL comparison in `isSessionValid` (`server.js:16`) that logs users out immediately after login. Graded by an independent verifier agent against three binary checks, receipts quoted from the transcripts. Raw artifacts in `results/` (response, diff, timing per run).

## Scorecard

| run | scope | verify | clarity | found bug | duration |
|---|---|---|---|---|---|
| 1a `fix the login bug` | PASS | **FAIL** | PASS | yes | 98s |
| 1b enhanced | PASS | PASS | PASS | yes | 96s |
| 2a `write tests` | **FAIL** | **FAIL** | PASS | yes | 149s |
| 2b enhanced | PASS | PASS | PASS | yes (reported as finding) | 126s |
| 3a `why do users get logged out…` | **FAIL** | PASS | PASS | yes | 123s |
| 3b enhanced | PASS | PASS | PASS | yes | 65s |
| 4 pass-through control | PASS (behavior) | n/a | PASS | — | 55s |

**Original arm: scope 1/3, verification 1/3. Enhanced arm: scope 3/3, verification 3/3.** Clarity 3/3 both arms.

## The headline finding

Claude Fable 5 found the planted bug in **every run, both arms** — raw capability was never the differentiator. What the enhanced prompts changed was *behavior*:

- **1a vs 1b** — 1a fixed the bug correctly but *claimed* verification ("verified live") with zero pasted output. 1b, whose prompt demanded "show the command output for both," produced genuine red-before-green: a failing `AssertionError … exit=1` before the fix, `ALL TESTS PASSED / exit=0` after.
- **2a vs 2b** — 2a was asked to write tests and *also patched `server.js`* (scope creep), then asserted "pass 16, fail 0" without pasting the run. 2b, bounded to "tests only — report failures as findings," left the app code untouched, pasted the real `node --test` tail (`17 tests, 12 pass, 5 fail`), and reported the 5 failures as one real bug rather than adjusting tests to pass.
- **3a vs 3b** — 3a was asked *why* and answered by silently fixing the code. 3b ("assess-and-report only — change nothing") produced an empty diff and reproduced the bug live over HTTP (`GET /me right after login → 401 Unauthorized`), citing `server.js:16`.

The unrequested fix in 3a is exactly the failure mode Anthropic's guide flags under "State the boundaries."

## Caveats (report these, always)

- **n=3 pairs, one fixture, one grader.** Directional, not statistical. Reproduce it: `bash evals/run-evals.sh`.
- **Pass-through control:** behaviorally correct — the already-good prompt was executed as-is with zero changes and an honest "cannot assess — ./migrations does not exist" verdict — but the transcript contains no "Already Fable-shaped" acknowledgment, so we cannot confirm the *skill itself* fired in headless `-p` mode (vs. the model just behaving well). Interactive-session pass-through verification is still open.
- Both arms ran with the machine's normal user-level hooks active; identical treatment, so the A/B comparison is fair, but absolute behavior may differ on a clean install.
- The grader is an LLM agent (skeptical, receipt-based, but still an LLM). Raw transcripts are in `results/` — check its work.
