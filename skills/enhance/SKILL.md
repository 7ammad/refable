---
name: enhance
description: Re-engineer a short or under-specified prompt into a Claude Fable 5-shaped prompt, using Anthropic's official "Prompting Claude Fable 5" guide. Use when the user invokes /enhance, or when their request is a single short line whose intent, boundaries, or success criteria are ambiguous. Show the rewrite with pattern tags, then run it on confirmation.
---

# Enhance — Fable 5 prompt re-engineering

You re-engineer the user's short prompt into the prompt they would have written if they had read Anthropic's [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) guide. The guide's core lesson: **Fable 5 rewards intent and boundaries, and is degraded by over-prescription.** Half the time the right enhancement is subtraction.

## Step 1 — Sufficiency check (the pass-through rule)

If the prompt already carries (a) the intent behind the request, (b) boundaries on what to do or not do, and (c) a recognizable definition of done — **do not touch it**. Say "Already Fable-shaped — running as-is" and proceed. Never add words to a prompt that doesn't need them.

## Step 2 — Add only what's missing

Build the enhanced prompt from these five patterns, adding **only** the ones absent. Infer content from session context, the repo, and conversation history before asking; if a load-bearing fact is genuinely unknowable, ask ONE compact question.

1. **Intent** (`why`, guide: "Give the reason, not only the request")
   Frame: `I'm working on [larger task] for [who it's for]. They need [what the output enables]. With that in mind: [request].`
2. **Boundaries** (`bounds`, guide: "State the boundaries")
   Is this assess-and-report, or make-changes? What's explicitly out of scope? If the user is describing a problem or thinking out loud, the deliverable is an assessment, not a fix.
3. **Done + verification** (`verify`, guide: "Ground progress claims" / "Make self-verification explicit")
   What does done look like, and how should Claude check it? For long tasks: claims must be grounded in tool results; for builds: name the command or observation that proves it works.
4. **Output contract** (`output`, guide: "Strong instruction following" / "Readability")
   Lead with the outcome; complete sentences over fragments and arrow chains; selectivity over compression.
5. **Autonomy level** (`auto`, guide: "Longer turns by default" / "Rare cases of early stopping")
   When enough information exists to act, act; pause only for destructive/irreversible actions, real scope changes, or input only the user can provide. Optionally suggest an effort level (high default; low/medium for routine work).

## Step 3 — Subtract (this is what makes it Fable-shaped)

Strip from the user's prompt, and never add:

- **Roleplay preambles** ("Act as a world-class senior engineer…") — Fable 5 doesn't need a costume.
- **Step-by-step micromanagement** of how to do the task — the guide is explicit that overly prescriptive instructions "can degrade output quality." State the outcome, not the procedure.
- **Redundant constraint stacks** — one brief instruction steers Fable 5 as well as an enumerated list.
- **"Show your reasoning" / "think step by step and explain your thinking" instructions** — on Fable 5 these can trigger the `reasoning_extraction` refusal category and cause fallbacks. Delete them; adaptive thinking already handles reasoning internally.
- **Defensive over-specification** ("don't hallucinate," "be accurate") — noise; replace with a concrete verification step if accuracy matters.

## Step 4 — Present, then run

Show the result in this shape, then run the enhanced prompt on the user's confirmation:

```
**Original:** <their line>

**Enhanced:**
<the re-engineered prompt>

**Changes:** [why] added intent · [bounds] assess-only · [verify] added done-check · [-] stripped roleplay
```

Each tag cites the guide pattern applied. If the user says "just run it" or has configured auto mode, skip the confirmation but still show the one-line change summary.

## Hard limits

- Enhanced prompt ≤ ~150 words unless the task is genuinely long-horizon (multi-hour autonomous work), where the verification and checkpoint patterns earn more space.
- Never fabricate intent. An inferred intent is stated so the user can correct it cheaply; a guessed domain fact is a question, not an assertion.
- Never enhance a prompt into a different task than the user asked for. Ambition in execution, fidelity in scope.
