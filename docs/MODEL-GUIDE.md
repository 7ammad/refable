# Which Claude model, and at what effort

A working summary of Anthropic's guide ["Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku"](https://claude.dev/blog/which-claude-model-should-you-build-with/) (claude.dev, 9 November 2026), announced by [@ClaudeDevs](https://x.com/ClaudeDevs/status/2119898687803621427). The figures below are quoted from that guide. Read the original before you rely on a number, because prices and defaults change.

## The short version

Start most work on **Opus 5.5 at medium effort**. Move down for simpler work, and up only when the work is hard enough to need it.

| Work | Start on | Starting effort |
|---|---|---|
| Classification, routing, tagging, high-volume extraction | Haiku 5.5 | default |
| Subagents that search files, read logs or summarise | Haiku 5.5 or Sonnet 5.5 | default |
| Chat and interactive sessions | Sonnet 5.5 | low or medium |
| Well-scoped coding: bug fixes, feature iteration, work against a spec | Sonnet 5.5 | medium, then high |
| Everyday documents, slides and spreadsheets | Sonnet 5.5 | high (medium in Claude Code) |
| Agent tasks you run repeatedly: investigation, review, drafting | Sonnet 5.5 | medium |
| Everyday engineering and debugging, multi-PR features | Opus 5.5 | medium, then high |
| Computer use and vision-heavy workflows | Opus 5.5 | medium |
| Major refactors and migrations, architecture planning, leading many subagents | Fable 5.2 | medium, then high |
| Deep research, scientific or quantitative analysis | Fable 5.2 | medium, then high |
| Not sure yet | Opus 5.5 | medium |

## List prices

Per million tokens, input / output, Claude API list prices as given in the guide.

| Model | Input / output | Cache reads |
|---|---|---|
| Haiku 5.5 | $0.10 / $0.50 for prompts up to 100K tokens, $0.50 / $2.50 above | $0.01 up to 100K, $0.05 above |
| Sonnet 5.5 | $2 / $10 | $0.10 |
| Opus 5.5 | $4 / $20 | $0.20 |
| Fable 5.2 | $8 / $40 | $0.20 |

All four have a 1M-token context window and 128K maximum output.

## Effort before model

Effort is a finer dial than the model. The guide's order when a model is not good enough:

1. Check that the model can verify its own work, with a test, a build or a script.
2. Raise effort one level.
3. Move to the next model up, and start it at a lower effort than you used on the smaller one.

Past `high`, one more effort level can cost as much as a bigger model. Before raising Opus 5.5 past high on a hard task, test Fable 5.2. On Anthropic's FrontierCode 2.0 runs, Fable 5.2 at high scored about level with Opus 5.5 at max (45.3% against 45.5%) for roughly half the cost per task.

If outcomes can be checked automatically, run everything low and re-run only the failures high. On a SWE-bench Pro subset, the guide reports Opus 5.5 at low with failures re-run at high passed about 97% of tasks for about $0.17 each, against 95.3% for $0.29 with every task at high.

## Mixing models

- **Put subagents on smaller models.** In Claude Code, set `model: haiku` or `model: sonnet` in a subagent's definition, or set `CLAUDE_CODE_SUBAGENT_MODEL` for subagents that do not name one. Keep small models on work where a mistake is cheap to spot. Keep code edits and judgement calls on the main model.
- **Keep the big model's context lean.** Each turn resends the context. Let cheaper workers do the verbose reading and hand back a summary.
- **Delegate bulk work.** On an internal defect search over about 22 million tokens of source, an Opus 5.5 lead over Sonnet 5.5 workers cost about a third less than Opus 5.5 alone and scored about the same.
- **Switch at a natural break.** The prompt cache belongs to the model that wrote it. Compact first, or start a fresh session with a short written plan. Moving down from Fable 5.2 to another model drops its earlier reasoning.

## How refable uses this

The `enhance` skill puts a route line on every prompt it shapes, such as `Run on: Opus 5.5 · medium`, using the table at the top. It adds one house rule on top of the guide: the top model plans and decides, and it does not do the bulk reading itself. That rule is a working preference, not Anthropic's guidance. The guide lists deep research under Fable 5.2 without that split.

## Measure on your own work

Published benchmarks give you a starting model. Then take a sample of your real tasks, write an outcome check for each, run each candidate at two or three effort levels, and plot score against spend. Keep a multi-model setup only if it beats every single-model point.
