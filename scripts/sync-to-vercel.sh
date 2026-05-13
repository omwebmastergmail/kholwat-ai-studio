#!/usr/bin/env bash
# sync-to-vercel.sh
# Merge `main` (Lovable / Cloudflare config) into `vercel-ssr` (Vercel preset)
# while preserving the Vercel-specific overrides on these files:
#   - vite.config.ts
#   - wrangler.jsonc      (deleted on vercel-ssr)
#   - src/server.ts       (deleted on vercel-ssr)
#   - vercel.json         (deleted on vercel-ssr)
#
# Usage:
#   ./scripts/sync-to-vercel.sh           # merge & push
#   ./scripts/sync-to-vercel.sh --no-push # merge only, don't push
#
# Requirements: clean working tree, both branches exist locally,
# remote `origin` configured.

set -euo pipefail

MAIN_BRANCH="main"
TARGET_BRANCH="vercel-ssr"
PUSH=true
[[ "${1:-}" == "--no-push" ]] && PUSH=false

# Files where the vercel-ssr version always wins on conflict.
# Files marked DELETE_ON_VERCEL must remain absent on vercel-ssr.
KEEP_OURS=("vite.config.ts")
DELETE_ON_VERCEL=("wrangler.jsonc" "src/server.ts" "vercel.json")

color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "▶ $1"; }
ok()    { color "1;32" "✓ $1"; }
err()   { color "1;31" "✗ $1" >&2; }

# --- Pre-flight ---------------------------------------------------------------
if [[ -n "$(git status --porcelain)" ]]; then
  err "Working tree is not clean. Commit or stash changes first."
  exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/${TARGET_BRANCH}"; then
  err "Branch '${TARGET_BRANCH}' does not exist locally."
  err "Create it first:  git checkout -b ${TARGET_BRANCH}"
  exit 1
fi

info "Fetching latest from origin..."
git fetch origin --prune

# --- Switch to target & update ------------------------------------------------
info "Checking out ${TARGET_BRANCH}..."
git checkout "${TARGET_BRANCH}"

if git ls-remote --exit-code --heads origin "${TARGET_BRANCH}" >/dev/null 2>&1; then
  info "Pulling latest ${TARGET_BRANCH} from origin..."
  git pull --ff-only origin "${TARGET_BRANCH}" || {
    err "Cannot fast-forward ${TARGET_BRANCH}. Resolve manually."
    exit 1
  }
fi

# --- Merge main, auto-resolve conflicts ---------------------------------------
info "Merging origin/${MAIN_BRANCH} into ${TARGET_BRANCH}..."
if git merge --no-ff --no-commit "origin/${MAIN_BRANCH}"; then
  ok "Merge clean — no conflicts."
else
  info "Conflicts detected. Auto-resolving Vercel-specific files..."

  # Keep our (vercel-ssr) version for these files.
  for f in "${KEEP_OURS[@]}"; do
    if git ls-files -u -- "$f" | grep -q .; then
      git checkout --ours -- "$f"
      git add -- "$f"
      ok "  kept ours:  $f"
    fi
  done

  # These files must NOT exist on vercel-ssr — remove if main re-added them.
  for f in "${DELETE_ON_VERCEL[@]}"; do
    if git ls-files -u -- "$f" | grep -q . || [[ -e "$f" ]]; then
      git rm -f --ignore-unmatch -- "$f" >/dev/null 2>&1 || true
      ok "  removed:    $f"
    fi
  done

  # Verify no conflicts remain.
  if git ls-files -u | grep -q .; then
    err "Unresolved conflicts remain in:"
    git ls-files -u | awk '{print "    " $4}' | sort -u >&2
    err "Resolve manually, then run:  git commit && git push origin ${TARGET_BRANCH}"
    exit 1
  fi
fi

# --- Commit if needed ---------------------------------------------------------
if git diff --cached --quiet && [[ ! -f .git/MERGE_HEAD ]]; then
  ok "Nothing to commit — already up to date."
else
  git commit --no-edit -m "chore: sync ${MAIN_BRANCH} into ${TARGET_BRANCH} (Vercel overrides preserved)" \
    || git commit --no-edit
  ok "Merge committed."
fi

# --- Push ---------------------------------------------------------------------
if $PUSH; then
  info "Pushing ${TARGET_BRANCH} to origin..."
  git push origin "${TARGET_BRANCH}"
  ok "Pushed. Vercel will start a new deploy."
else
  info "Skipping push (--no-push). Run manually:  git push origin ${TARGET_BRANCH}"
fi

ok "Done."
