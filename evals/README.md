# Evals — prove it on your own work

The Fable 5 guide warns that over-prescriptive prompts degrade output. So don't take refable's word for it — A/B it.

## Protocol

For each prompt in `prompts.md` (or better, six short prompts from your own history):

1. Run the **original** short line in a fresh Claude session. Save the result.
2. Run the **refable-enhanced** version in another fresh session. Save the result.
3. Score both blind on three binary checks:
   - **Scope fidelity** — did it do the task asked, no more, no less?
   - **Verification** — did it prove the work (test output, repro, receipt) or just claim it?
   - **First-message clarity** — does the reply lead with the outcome you needed?

A win for refable is ≥2/3 checks improving with no check regressing. If the enhanced prompt loses on your workload, file an issue with the pair — that's exactly the feedback the rubric needs.

## Notes

- Fresh sessions matter: in a warm session Claude already has the context refable would have added, which understates the effect.
- Test the pass-through too: give `/enhance` an already-good prompt and confirm it declines to touch it. An enhancer that always adds words is broken by its own spec.
