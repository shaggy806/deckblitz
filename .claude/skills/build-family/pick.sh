#!/bin/bash
# pick.sh <commit>...: cherry-pick each agent commit onto main, resolving the routine conflicts
# keeping both sides (pickfix.py). Stops, leaving the pick in progress, on a conflict in any
# other file, and when a word merge of a doc conflicts for real.
#
# Keeping both sides isn't always enough. After every run, before trusting it:
# `npx tsc -p tsconfig.tests.json --noEmit` from engine/, because a union of oracle-parse.test.ts can
# drop a block's closer, and `npx tsc -b` from client/. A conflict in manualChecks.ts or game.ts is
# never routine here: a union interleaves manualChecks.ts's presets, so resolve those by hand.
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE/../../.." || exit 2
FIX="$HERE/pickfix.py"
for c in "$@"; do
  if git cherry-pick "$c" >/dev/null 2>&1; then
    echo "$c clean"
    continue
  fi
  for f in $(git diff --name-only --diff-filter=U); do
    case "$f" in
      engine/src/cards/top-commanders-gaps.json) python "$FIX" json "$f" ;;
      docs/architecture/engine.md|engine/src/cards/AUTHORING.md) python "$FIX" words "$f" ;;
      engine/src/cards/neededCards-features.md|docs/manual-checks.md|engine/scripts/oracle-parse.mjs|engine/src/test/oracle-parse.test.ts) python "$FIX" union "$f" ;;
      *) echo "$c: STOP, not routine: $f"; exit 1 ;;
    esac || { echo "$c: STOP, $f failed"; exit 1; }
    git add "$f" 2>/dev/null
  done
  git -c core.editor=true cherry-pick --continue >/dev/null 2>&1 || { echo "$c: STOP, continue failed"; exit 1; }
  echo "$c resolved"
done
node --check engine/scripts/oracle-parse.mjs && echo "parser parses"
python -c "
b=open('engine/src/game.ts','rb').read()
print('game.ts crlf',b.count(b'\r\n'),'lf',b.count(b'\n'),'nul',b.count(b'\0'))"
