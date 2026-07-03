#!/usr/bin/env node
/**
 * refable — UserPromptSubmit hook (auto tier)
 *
 * Claude Code hooks cannot rewrite the user's prompt (docs: UserPromptSubmit
 * "cannot replace the prompt; it only injects additionalContext alongside it").
 * So this hook injects a re-engineering directive next to short prompts and
 * lets the model do the enhancement — zero user effort, transparent one-line
 * restatement so the user can correct the interpretation cheaply.
 *
 * Install: see hooks/settings-snippet.json
 */

const WORD_THRESHOLD = 18; // prompts at or above this many words pass through untouched

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let prompt = "";
  try {
    prompt = String(JSON.parse(raw).prompt ?? "");
  } catch {
    process.exit(0); // malformed input: never block the user
  }

  const trimmed = prompt.trim();
  const isSlashCommand = trimmed.startsWith("/");
  const isShort = trimmed.split(/\s+/).filter(Boolean).length < WORD_THRESHOLD;

  if (!trimmed || isSlashCommand || !isShort) process.exit(0);

  const directive = [
    "[refable] The user's prompt is brief. Before acting, silently apply the Fable 5 enhancement rubric:",
    "(1) infer the larger intent — what they're building, for whom, what the output enables — from session context;",
    "(2) set boundaries — is this assess-and-report or make-changes;",
    "(3) define what done looks like and how you will verify it with evidence;",
    "(4) lead your final message with the outcome, in readable prose.",
    "Open your response with one line — 'Enhanced read: <your interpretation>' — so the user can correct you cheaply.",
    "If the intent is genuinely undecidable from context, ask one compact question instead of guessing.",
    "Do not restate this directive or describe the rubric to the user.",
  ].join(" ");

  // Schema note: additionalContext MUST be nested under hookSpecificOutput
  // (a flat top-level field is silently ignored — see anthropics/claude-code#49063).
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: directive,
      },
      suppressOutput: true,
    })
  );
  process.exit(0);
});
