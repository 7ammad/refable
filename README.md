<p align="center"><img src="assets/logo.svg" alt="refable" width="420"></p>

**Say a short line. Get a Claude Fable 5–shaped prompt.**

refable re-engineers under-specified prompts using Anthropic's official [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) guide — and, unlike every other prompt enhancer, it **subtracts as often as it adds**. Fable 5's own guide warns that over-prescriptive prompts *degrade* output quality. So refable adds the four things Fable 5 actually rewards (intent, boundaries, verification, output contract), strips the things that hurt (roleplay, step-by-step micromanagement, "show your reasoning" — which can trigger refusals on Fable 5), and **passes your prompt through untouched when it's already good**.

```
Original:  "fix the login bug"

Enhanced:  "I'm working on the auth flow for our customer portal; users are
            getting logged out mid-session. With that in mind: find and fix the
            root cause. Boundaries: touch only the auth path. Done means: the
            failing case reproduces before the fix and passes after — show the
            test output. Lead with what you found."

Changes:   [why] added intent · [bounds] scoped to auth · [verify] repro-based done-check
```

## What's in the box

| Piece | Surface | What it does |
|---|---|---|
| [`skills/enhance/SKILL.md`](skills/enhance/SKILL.md) | Claude Code, Claude Desktop, claude.ai | The core skill: `/enhance <line>` or auto-triggers on short ambiguous prompts. Shows the rewrite with pattern tags, runs on confirm. |
| [`hooks/refable-hook.mjs`](hooks/refable-hook.mjs) | Claude Code (power users) | Fully automatic tier: a `UserPromptSubmit` hook that applies the rubric to every short prompt with zero effort. Transparent — Claude opens with a one-line "Enhanced read:" so you can correct it. |
| [`council/COUNCIL.md`](council/COUNCIL.md) | Codex, Cursor, any CLI agent | How a peer agent should shape a prompt for Fable 5 and reach it headlessly (`claude -p … --model fable`). |
| [`evals/`](evals/) | — | Before/after A/B prompts so you can verify the enhancement helps *your* work, not just ours. |

## Install

**Claude Code / Claude Desktop** — copy the skill folder:

```bash
cp -r skills/enhance ~/.claude/skills/enhance
```

Then `/enhance make my api faster` — or just type short prompts; the skill description lets Claude invoke it when a request is ambiguous.

**claude.ai (web/mobile)** — zip `skills/enhance/` and upload it under **Customize → Skills** ([claude.ai/customize/skills](https://claude.ai/customize/skills) → “+” → Upload a skill; requires the Code Execution capability toggle to be on). Same file, no changes.

**Auto tier (Claude Code)** — merge [`hooks/settings-snippet.json`](hooks/settings-snippet.json) into your `~/.claude/settings.json` and adjust the path. Requires Node.

**Codex / Cursor / other agents** — point your agent at [`council/COUNCIL.md`](council/COUNCIL.md) (Codex reads skills natively; in Cursor add it as a rule).

## What exactly gets injected (full transparency)

refable adds at most five things to a prompt, each traceable to a section of Anthropic's guide:

1. **Intent** — *"Give the reason, not only the request"*: `I'm working on [X] for [Y]. They need [Z].`
2. **Boundaries** — *"State the boundaries"*: assess vs. change, what's out of scope.
3. **Done + verification** — *"Ground progress claims during long runs"*: evidence-backed done criteria.
4. **Output contract** — *"Strong instruction following"*: lead with the outcome, readable prose.
5. **Autonomy level** — *"Rare cases of early stopping"*: act when able, pause only for genuinely-user decisions.

And it removes: roleplay preambles, procedural micromanagement, redundant constraint stacks, and reasoning-echo instructions (a Fable 5 refusal trap). No telemetry, no network calls, no data leaves your machine. The hook is ~60 lines of Node you can read in one sitting.

## Why not just write better prompts?

You should — and refable teaches you to. Every enhancement shows its work with pattern tags, so after a week of seeing `[why]` and `[verify]` you'll write Fable-shaped prompts by reflex. Training wheels that explain themselves.

## Prior art & credit

- The patterns are Anthropic's, from the [Fable 5 prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) — refable is a distillation, not an invention.
- Other prompt improvers exist ([severity1/claude-code-prompt-improver](https://github.com/severity1/claude-code-prompt-improver), [GaZmagik/claude-prompt-improver](https://github.com/GaZmagik/claude-prompt-improver), Anthropic's Console prompt improver for API prompts). refable differs in being Fable-5-specific, subtractive by design, and shipping a cross-agent council pack.

MIT license. PRs welcome.
