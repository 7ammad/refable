# X thread draft (opt-in explainer)

**1/**
Anthropic published the official prompting guide for Claude Fable 5.

We turned it into a skill: type a short line, it re-engineers your prompt per the guide — and half the time it makes your prompt SHORTER.

Open source, no telemetry, works in Claude Code, Desktop, claude.ai, Codex & Cursor. 🧵

**2/**
The counterintuitive part of the guide: Fable 5 is DEGRADED by over-prescription.

Roleplay preambles, step-by-step procedures, "think step by step and show your reasoning" — that last one can literally trigger a refusal on Fable 5.

Most prompt enhancers add exactly this junk. refable strips it.

[diagram: subtract-vs-add]

**3/**
What Fable 5 actually rewards — 5 patterns, straight from the guide:

• Intent — "I'm working on X for Y, they need Z"
• Boundaries — assess-only vs. make-changes
• Done + verification — evidence, not claims
• Output contract — outcome first, readable prose
• Autonomy — act when able, pause only for real decisions

**4/**
Before/after:

"fix the login bug"
→ "I'm working on the auth flow for our customer portal; users get logged out mid-session. Find and fix the root cause. Touch only the auth path. Done = the failing case reproduces before the fix, passes after — show the test output. Lead with what you found."

Every change is tagged with the guide section it came from.

**4b/**
We A/B'd it on a fixture repo with a planted auth bug (7 headless Fable 5 runs, independent grader, receipts in the repo).

Fable found the bug in EVERY run. That's not what changed.

Original prompts: 1/3 stayed in scope, 1/3 proved their work.
Enhanced prompts: 3/3 and 3/3.

"why do users get logged out?" → the bare version silently FIXED the code. The enhanced version (assess-only) reproduced it live over HTTP and changed nothing.

The model was never the problem. The prompt's missing boundaries were.

**5/**
Three ways to run it:

• /enhance — shows the rewrite, runs on your confirm (and teaches you the patterns)
• Auto-hook — every short prompt gets the treatment, zero effort
• Pass-through — if your prompt is already good, it refuses to touch it

An enhancer that always adds words is broken by its own spec.

**6/**
Bonus for the agent crowd: COUNCIL.md — how OTHER agents (Codex, Cursor, your orchestrator) should shape prompts for Fable 5 and reach it headlessly:

claude -p "..." --model fable --effort xhigh --output-format json

Model councils that speak Fable natively.

[diagram: architecture]

**7/**
It's ~one markdown file + a 60-line hook you can read in one sitting. MIT, no network calls, nothing leaves your machine.

Repo: https://github.com/7ammad/refable
The guide it distills: platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5

Ship better one-liners.

---

*Notes before posting: run the evals protocol first and put real numbers in tweet 4/ if we have them ("in our A/B, enhanced prompts won X/6 on scope-fidelity"). Credit prior art in a reply tweet (severity1's and GaZmagik's improvers, Anthropic's Console improver) — differentiation is Fable-5-specificity + subtraction + council pack, not "first."*
