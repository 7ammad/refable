# A/B prompt set

Six short prompts spanning the common shapes. For each: the original, and the questions the enhancer must answer to build the enhanced version (intent/boundaries/verification differ per user — fill from your context).

1. **Bug fix** — `fix the login bug`
2. **Build** — `make a landing page for my app`
3. **Review** — `review this PR`
4. **Feature** — `add dark mode`
5. **Diagnosis (assessment, not change!)** — `why is my docker build slow`
   - Key check: the enhanced prompt must set boundaries to *assess-and-report* — the un-enhanced line often triggers unrequested fixes.
6. **Tests** — `write tests`
   - Key check: the enhanced prompt should demand failure-mode tests with a red-before-green proof, not happy-path assertions.

## Pass-through control

7. `I'm migrating our billing service off Stripe Charges to PaymentIntents for the EU launch. Assess the diff in ./migrations for double-charge risk only — report findings, change nothing. Done means each risk cites the exact line. Lead with the verdict.`
   - Expected: **no enhancement**. If refable adds anything, the pass-through rule is broken.
