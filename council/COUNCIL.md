# Council pack — how peer agents should prompt Claude Fable 5

For Codex, Cursor, and any other CLI agent that wants a second opinion from Claude Fable 5 (a "model council" seat). Two parts: how to shape the ask, and how to reach Claude in the CLI.

## 1. Shape the ask (the Fable 5 template)

Wrap your request in this frame before sending — Fable 5 performs measurably better when it knows the intent, not just the task:

```text
I'm working on [the larger task] for [who it's for]. They need [what the output enables].
With that in mind: [the request].

Boundaries: [assess-and-report | make changes]. Out of scope: [what not to touch].
Done means: [observable outcome]. Verify by: [command / check / evidence].
Lead your reply with the outcome, then supporting detail.
```

### What NOT to send Fable 5

- **No roleplay** ("You are a 10x engineer…") — wasted tokens, no effect.
- **No step-by-step procedures** — over-prescription degrades Fable 5 output (per Anthropic's own guide). State the outcome you need.
- **Never ask it to echo or explain its internal reasoning** — that can trigger the `reasoning_extraction` refusal on Fable 5. Ask for conclusions and evidence, not chain-of-thought.
- **No "be careful / don't hallucinate" filler** — replace with a concrete verification instruction.

## 2. Reach Claude in the CLI

Headless one-shot (flags verified against `claude --help`, Claude Code 2026-07):

```bash
claude -p "<your Fable-shaped prompt>" --model fable --effort high --output-format json
```

- `--model fable` — alias for the latest Fable model.
- `--effort low|medium|high|xhigh|max` — the primary quality/latency dial. `high` default; `low`/`medium` for routine checks; `xhigh` for the hardest review calls.
- `--output-format json` — single structured result, easy for an agent to parse. Use `stream-json` for streaming.
- `--system-prompt "<role>"` — set a council role (e.g. reviewer) without polluting the user prompt.
- `--permission-mode default` and `--allowedTools "Read Grep Glob"` — restrict a council seat to read-only when you only want analysis, not edits.
- `--continue` / `--resume <id>` — keep a deliberation going across rounds instead of re-sending context.

### Example — Codex asks Fable 5 for an adversarial review

```bash
claude -p "I'm working on a payment-retry service for a fintech client. They need confidence this diff won't double-charge. With that in mind: review the attached diff for correctness bugs only. Boundaries: assess-and-report, change nothing. Done means: a list of confirmed issues, each with the failing input. Verify claims against the code, not the diff description. Lead with the verdict." \
  --model fable --effort xhigh --output-format json \
  --allowedTools "Read Grep Glob" --add-dir /path/to/repo
```

## 3. Council etiquette

- One question per invocation; use `--resume` for follow-ups.
- Give Fable 5 file access (`--add-dir`) rather than pasting code into the prompt when the repo is local — it verifies against source instead of trusting your excerpt.
- Treat a Fable "CONFIRMED" as a claim to spot-check, the same standard you'd want applied to your own output.
