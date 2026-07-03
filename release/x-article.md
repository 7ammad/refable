# Anthropic told us how to prompt Claude Fable 5. The advice is not what you think.

*refable is an open-source skill that re-engineers your short prompts per Anthropic's official Fable 5 guide — and about half the time, it makes them shorter. Here's why that's the whole point.*

---

## The counterintuitive lesson

When Anthropic published the [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) guide, most people skimmed it for new magic words. The actual headline is buried in the scaffolding section:

> "Skills developed for prior models are often too prescriptive for Claude Fable 5 and **can degrade output quality**."

Read that again. The prompt-engineering folklore we've all accumulated — roleplay preambles ("act as a world-class senior engineer"), ten-step procedures, stacked constraints, "think step by step and show your reasoning" — doesn't just waste tokens on Fable 5. It actively makes output worse. And that last one is worse than useless: instructing Fable 5 to echo its internal reasoning can trigger the `reasoning_extraction` refusal category and get your request bounced to a fallback model.

So the best prompt for Fable 5 is not a longer prompt. It's a *differently shaped* one.

## The shape Fable 5 rewards

Distilled from the guide, five things move the needle:

1. **Intent — the reason, not only the request.** The guide's own template: *"I'm working on [the larger task] for [who it's for]. They need [what the output enables]. With that in mind: [request]."* Fable 5 performs measurably better when it can connect your task to its purpose instead of guessing.
2. **Boundaries.** Is this assess-and-report, or make-changes? What's out of scope? Un-steered, a capable agent will fix things you only wanted diagnosed.
3. **Done + verification.** What does finished look like, and what evidence proves it? "Show the failing case before the fix and the passing case after" turns claims into receipts.
4. **Output contract.** Lead with the outcome; readable prose over compressed jargon.
5. **Autonomy level.** Act when there's enough information to act; pause only for genuinely irreversible calls or input only you can provide.

That's it. No personas. No procedures. No incantations.

## So we built refable

refable is a skill: you type a short line — `fix the login bug` — and it re-engineers the prompt using exactly those five patterns, shows you the rewrite with a tag citing which guide section each change came from, and runs it on your confirm.

```
Original:  "fix the login bug"

Enhanced:  "I'm working on the auth flow for this service; users are getting
            logged out mid-session. Find and fix the root cause. Touch only
            the auth path. Done means: the failing case reproduces before the
            fix and passes after — show the output. Lead with what you found."

Changes:   [why] added intent · [bounds] scoped to auth · [verify] repro-based done-check
```

And — the part that makes it different from every prompt enhancer before it — **refable subtracts**. It strips roleplay, micromanagement, redundant constraints, and reasoning-echo instructions. If your prompt already carries intent, boundaries, and a definition of done, refable refuses to touch it. An enhancer that always adds words is broken by its own spec.

## One markdown file, every surface

Agent Skills are plain markdown, so one `SKILL.md` covers:

- **Claude Code / Claude Desktop** — drop the folder into `~/.claude/skills/`, then `/enhance <line>`, or let it auto-trigger on ambiguous requests.
- **claude.ai** — zip the same folder, upload under Customize → Skills. No changes.
- **Fully automatic (Claude Code)** — a 56-line `UserPromptSubmit` hook applies the rubric to every short prompt with zero effort. Claude opens with a one-line "Enhanced read:" so you can correct its interpretation cheaply.
- **Codex, Cursor, and model councils** — `COUNCIL.md` teaches *other agents* how to shape an ask for Fable 5 and reach it headlessly: `claude -p "..." --model fable --effort xhigh --output-format json`. If you run multi-model setups, this is the missing manual for the Claude seat.

## The bug our own fact-checker caught

Build-in-public honesty: the first version of the hook was silently broken. Claude Code hook docs nest `additionalContext` under `hookSpecificOutput` — we shipped it flat, and flat gets *silently ignored* (see claude-code#49063). Our unit tests were green, because unit tests confirm your intent, not reality. An independent fact-check agent caught it against the docs' verbatim examples, and the live re-test told the story: flat shape → nothing injected; nested shape → the model's actual reply opened with "Enhanced read: …".

The fix ships proven, and the lesson is in the repo: harness integrations are only verified by running the harness.

## Does it actually help?

We don't ask you to take our word — the repo ships an eval protocol (`evals/`): a small fixture service with a planted session bug, original-vs-enhanced prompt pairs, and three binary checks per response (scope fidelity, evidence-backed verification, outcome-first clarity), plus a pass-through control where the correct behavior is to change nothing.

We ran it: 7 headless Fable 5 runs, each in a fresh git-tracked copy of the fixture, graded by an independent verifier agent quoting receipts from the transcripts.

The result that matters: **Fable 5 found the planted bug in every single run, both arms.** Capability was never the differentiator. Behavior was:

| | original prompts | refable-enhanced |
|---|---|---|
| stayed in scope | 1/3 | **3/3** |
| proved the work with real output | 1/3 | **3/3** |
| led with the outcome | 3/3 | 3/3 |

The sharpest case: asked *"why do users get logged out right after logging in"* — a question — the bare prompt run silently **fixed the code**. The enhanced version ("assess-and-report only — change nothing") produced an empty diff, reproduced the bug live over HTTP (`GET /me` right after login → `401`), and cited the exact line. That unrequested fix is precisely the failure mode Anthropic's guide warns about under "State the boundaries."

Honest caveats, in the repo alongside the numbers: three pairs, one fixture, one LLM grader — directional, not statistical. The full transcripts, diffs, and the runner script ship with the repo; reproduce it in one command.

Run it on your own prompts. If the enhanced version loses on your workload, file an issue with the pair — that's exactly the feedback the rubric needs.

## Get it

The whole thing is one markdown file, a 56-line hook you can read in one sitting, and zero telemetry — nothing leaves your machine.

**Repo: https://github.com/7ammad/refable** · The guide it distills: [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5)

*Prior art credit: Anthropic's Console prompt improver (API-side), severity1's and GaZmagik's Claude Code prompt improvers. refable's difference: Fable-5-specific, subtractive by design, and the cross-agent council pack.*
