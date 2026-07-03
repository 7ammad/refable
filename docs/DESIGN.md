# refable — design one-pager

## Problem statement

How might we let anyone get Fable 5–grade results from a one-line prompt, by automatically re-engineering it per Anthropic's official guide — without the bloat that the same guide says degrades output?

## Recommended direction

One portable `SKILL.md` as the core artifact, deployed to four surfaces without modification: Claude Code + Claude Desktop (skill folder), claude.ai web (zip upload), and other CLI agents (markdown they can read natively). Two tiers of automation: explicit `/enhance` that shows the rewrite with pattern tags and runs on confirm (the trust-and-teaching tier), and a `UserPromptSubmit` hook that injects the rubric alongside every short prompt (the zero-effort tier — hooks verifiably cannot rewrite prompts, so injection-plus-model-side-enhancement is the mechanism, with a one-line "Enhanced read:" for transparency).

The differentiator is subtraction: the enhancer strips roleplay, procedural micromanagement, and reasoning-echo instructions (a documented Fable 5 refusal trap), and passes through prompts that are already sufficient. Plus the council pack: the only artifact that teaches *other agents* (Codex, Cursor) how to shape asks for Fable 5 and reach it via `claude -p`.

## Key assumptions to validate

- [x] Enhanced prompts beat originals on real workloads — RUN 2026-07-02 (7 headless Fable runs, planted-bug fixture, independent grader): original arm scope 1/3 + verification 1/3, enhanced arm 3/3 + 3/3; bug found by all runs, so the delta is behavioral discipline, not capability. Full receipts: `evals/results.md`.
- [ ] The skill auto-triggers acceptably on claude.ai (model-decided, softer than Claude Code) — test with the zip upload (path: Customize → Skills).
- [ ] The hook's 18-word threshold catches the right prompts without annoying power users — dogfood a week.
- [x] The hook actually injects in a real session — VERIFIED 2026-07-02 via `claude -p --settings … --debug-file`: harness logged `provided additionalContext (691 chars)` and the response opened with "Enhanced read:". Required the documented `hookSpecificOutput` nesting; the flat shape fails silently (claude-code#49063).

## MVP scope

Skill + hook + council pack + evals + README + two diagrams + X thread. No more.

## Not doing (and why)

- **Browser extension** — claude.ai skill upload covers the web surface with zero extension maintenance.
- **MCP server** — markdown is the most portable substrate; a server adds an install step and a process for no capability gain.
- **Multi-model support** — Fable-5-specificity IS the positioning; a generic enhancer is a crowded category.
- **Telemetry/analytics** — trust is the product; the pitch is "read the 60-line hook yourself."
- **Paid anything** — distribution play, MIT.

## Open questions

- Final name (refable is a working title) and repo owner account.
- Whether to submit to anthropics/skills or awesome-claude-code style indexes at launch or after feedback.
