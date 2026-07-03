#!/usr/bin/env bash
# refable eval runner — A/B: original short prompts vs refable-enhanced prompts,
# each in a fresh copy of evals/fixture with git tracking so we can diff what the run changed.
# Usage: bash evals/run-evals.sh [results-dir]
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RESULTS="${1:-$ROOT/evals/results}"
MODEL="${REFABLE_EVAL_MODEL:-fable}"
LIMIT_S="${REFABLE_EVAL_TIMEOUT:-600}"

TIMEOUT_CMD=""
command -v timeout >/dev/null 2>&1 && TIMEOUT_CMD="timeout ${LIMIT_S}"

mkdir -p "$RESULTS"

run_one() {
  local id="$1" promptfile="$2" with_skill="${3:-no}"
  local out="$RESULTS/$id"
  local work
  work="$(mktemp -d)"
  mkdir -p "$out"

  cp -r "$ROOT/evals/fixture/." "$work/"
  if [ "$with_skill" = "yes" ]; then
    mkdir -p "$work/.claude/skills/enhance"
    cp "$ROOT/skills/enhance/SKILL.md" "$work/.claude/skills/enhance/SKILL.md"
  fi
  (cd "$work" && git init -q && git add -A && git -c user.email=eval@refable -c user.name=refable commit -qm base)

  local start end
  start=$(date +%s)
  (cd "$work" && $TIMEOUT_CMD claude -p "$(cat "$promptfile")" \
      --model "$MODEL" \
      --permission-mode acceptEdits \
      --allowedTools "Bash Read Edit Write Glob Grep" \
      > "$out/response.md" 2> "$out/stderr.txt")
  local code=$?
  end=$(date +%s)

  (cd "$work" && git add -A && git diff --cached --stat > "$out/diffstat.txt" && git diff --cached > "$out/diff.patch")
  cp "$promptfile" "$out/prompt.txt"
  echo "exit=$code duration_s=$((end - start)) model=$MODEL" > "$out/meta.txt"
  echo "[$id] done exit=$code $((end - start))s"
}

run_one "1a-original"    "$ROOT/evals/pairs/1a-original.txt"
run_one "1b-enhanced"    "$ROOT/evals/pairs/1b-enhanced.txt"
run_one "2a-original"    "$ROOT/evals/pairs/2a-original.txt"
run_one "2b-enhanced"    "$ROOT/evals/pairs/2b-enhanced.txt"
run_one "3a-original"    "$ROOT/evals/pairs/3a-original.txt"
run_one "3b-enhanced"    "$ROOT/evals/pairs/3b-enhanced.txt"
run_one "4-passthrough"  "$ROOT/evals/pairs/4-passthrough.txt" "yes"

echo "ALL RUNS COMPLETE -> $RESULTS"
