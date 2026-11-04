#!/usr/bin/env python3
"""pick.py <commit>...: cherry-pick each agent commit onto main, resolving the routine conflicts
by keeping both sides (pickfix.py). Stops, leaving the pick in progress, on a conflict in any
other file, and when a word merge of a doc conflicts for real.

Python, not shell: a CRLF checkout breaks a shell script.

Keeping both sides isn't always enough. After every run, before trusting it:
`npx tsc -p tsconfig.tests.json --noEmit` from engine/, because a union of oracle-parse.test.ts can
drop a block's closer, and `npx tsc -b` from client/. A conflict in manualChecks.ts or game.ts is
never routine here: a union interleaves manualChecks.ts's presets, so resolve those by hand.
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FIX = os.path.join(HERE, "pickfix.py")
os.chdir(os.path.join(HERE, "..", "..", ".."))

MODES = {
    "engine/src/cards/top-commanders-gaps.json": "json",
    "docs/architecture/engine.md": "words",
    "engine/src/cards/AUTHORING.md": "words",
    "engine/src/cards/neededCards-features.md": "union",
    "docs/manual-checks.md": "union",
    "engine/scripts/oracle-parse.mjs": "union",
    "engine/src/test/oracle-parse.test.ts": "union",
}


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True)


for commit in sys.argv[1:]:
    if git("cherry-pick", commit).returncode == 0:
        print(commit, "clean")
        continue
    for path in git("diff", "--name-only", "--diff-filter=U").stdout.split():
        mode = MODES.get(path)
        if mode is None:
            sys.exit(f"{commit}: STOP, not routine: {path}")
        if subprocess.run([sys.executable, FIX, mode, path]).returncode != 0:
            sys.exit(f"{commit}: STOP, {path} failed")
        git("add", path)
    if git("-c", "core.editor=true", "cherry-pick", "--continue").returncode != 0:
        sys.exit(f"{commit}: STOP, continue failed")
    print(commit, "resolved")

if subprocess.run(["node", "--check", "engine/scripts/oracle-parse.mjs"]).returncode == 0:
    print("parser parses")
data = open("engine/src/game.ts", "rb").read()
print("game.ts crlf", data.count(b"\r\n"), "lf", data.count(b"\n"), "nul", data.count(b"\0"))
