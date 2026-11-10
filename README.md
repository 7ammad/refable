<p align="center"><img src="assets/logo.svg" alt="refable" width="420"></p>

**Say a short line. Get a prompt shaped for the Claude model that should run it, and the name of that model.**

refable is a skill that re-engineers short, under-specified prompts using Anthropic's own prompting guides. Version 2 covers **Claude Fable 5.2 and Claude Opus 5.5**, and adds a routing step: every enhanced prompt comes with a line that says which model and effort level it belongs on.

It still subtracts as often as it adds. It adds what the guides say these models reward (the reason, the boundaries, a check the model can run, exact approvals) and removes what hurts (role costumes, step-by-step procedure, "show your reasoning", stacked cautions). A prompt that is already good passes through untouched.

```
Original:  fix the login bug

Run on:    Opus 5.5 · medium

Enhanced:  There is a login bug in this repo. Find it first: check recent
           commits, failing tests and the login paths, then reproduce the
           failure before changing anything. Fix the cause with the smallest
           change that does it, and leave unrelated code alone.
           Done means the failure you reproduced no longer happens, a test
           that failed before your change passes after it, and the existing
           tests still pass. Mark anything you could not run as unverified.
           Don't commit or push. Nothing else needs my go-ahead.
           Report what the bug was, how you reproduced it, which files
           changed and the test results.

Changes:   [why] find and reproduce first · [bounds] smallest fix
           [verify] failing test turns green · [approve] commit and push only
```

## What is new in v2

| | v1 (July 2026) | v2 (November 2026) |
|---|---|---|
| Models | Fable 5 | Fable 5.2 and Opus 5.5, each with its own shaping rules |
| Routing | none | a `Run on: <model> · <effort>` line from Anthropic's model guide |
| Approvals | "pause for destructive actions" | names the exact actions that need a go-ahead and says the rest need none |
| Long runs | autonomy level | finish-the-task text, and for Opus the specific early stops to avoid |
| Facts | infer from context | look first, mark anything assumed as `[inferred: ...]` |

Why the model-specific rules matter: the two guides disagree in places. "Answer directly without deliberating" can reduce thinking on Opus 5.5 at low effort, and Anthropic reports it did not stop Fable 5.2 from thinking at medium and above. Opus 5.5 starts work fast and benefits from one sentence telling it to look around first. Fable 5.2 follows cautions and style caps so literally that old ones have to come out. One generic rubric cannot do both.

## What is in the box

| Piece | What it does |
|---|---|
| [`skills/enhance/SKILL.md`](skills/enhance/SKILL.md) | The skill. `/enhance <line>`, or it triggers when a sizeable task arrives in one short line. Shows the rewrite, the route and the change tags. |
| [`docs/MODEL-GUIDE.md`](docs/MODEL-GUIDE.md) | When to use Haiku 5.5, Sonnet 5.5, Opus 5.5 and Fable 5.2, with prices and the effort-before-model ladder, summarised from Anthropic's guide. |
| [`hooks/refable-hook.mjs`](hooks/refable-hook.mjs) | Optional `UserPromptSubmit` hook from v1. It injects the short v1 rubric next to brief prompts. It still works, and it has not been updated for routing. |
| [`council/COUNCIL.md`](council/COUNCIL.md) | How Codex, Cursor or another CLI agent can shape an ask for Claude and reach it headlessly. Written for v1. |
| [`evals/`](evals/) | The v1 A/B runs and results. See "Evidence" below for what has and has not been tested on v2. |

## Install

**Claude Code and Claude Desktop.** Clone the repository and copy the skill folder:

```bash
git clone https://github.com/7ammad/refable
cd refable
cp -r skills/enhance ~/.claude/skills/enhance
```

Then type `/enhance make my api faster`.

**claude.ai.** Zip `skills/enhance/` and upload it under Customize → Skills. Same file, no changes.

**Cheaper workers in Claude Code.** To follow the model guide, set the default model for subagents that do not name one. In `~/.claude/settings.json`:

```json
{ "env": { "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet" } }
```

## What gets added, and what gets removed

Added, only when missing:

1. **Reason.** What the work is for and who uses the result.
2. **Boundaries.** Assess-and-report or make-changes, and what is out of scope.
3. **Done and how to check it.** A command, test or read-back that proves it.
4. **Approvals.** The exact actions that need a go-ahead. Both models apply approval rules as written, so a vague rule holds back routine work.
5. **Report.** What the deliverable is, where it is saved, and a closing report a reader can follow without having watched the work.
6. **Finish the task.** For long runs: carry on through ordinary obstacles, stop only for real blockers.

Removed: role costumes, step-by-step procedure, the same constraint said three ways, "be accurate" filler, and any instruction to write out reasoning in the reply (it can be refused as reasoning extraction).

No telemetry and no network calls. The skill is one Markdown file you can read in five minutes.

## Evidence, and its limits

- **v1 A/B (July 2026, Fable 5).** Seven headless runs on a planted-bug fixture. The original prompts scored 1 of 3 on scope and 1 of 3 on verification. The enhanced prompts scored 3 of 3 on both. The model found the bug in every run, so the difference was behaviour, not capability. Three pairs, one fixture, one LLM grader. Details in [`evals/results.md`](evals/results.md).
- **v2 dry run (10 November 2026, Opus 5.5).** One Opus 5.5 run applied the skill to three prompts without executing them: a vague one (rewritten), a well-specified one (passed through untouched) and a request for a prompt for another session (returned, not run). It also listed 13 ambiguities in the skill text, and the ones that mattered were fixed.
- **Not yet done for v2.** No before-and-after A/B on Fable 5.2 or Opus 5.5, and no test of the route line against real cost. If you run one, a pull request with your results is welcome.

## Credit

The patterns are Anthropic's. refable distils three public pages:

- [Prompting Claude Fable 5.2](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2)
- [Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5)
- [Which Claude model should you build with?](https://claude.dev/blog/which-claude-model-should-you-build-with/)

refable is an independent project and is not affiliated with Anthropic.

MIT license. Pull requests welcome.
