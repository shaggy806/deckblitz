#!/usr/bin/env python3
"""pick.py <commit>...: cherry-pick each agent commit onto main, resolving the routine conflicts
by keeping both sides (pickfix.py). On a conflict in any other file (game.ts, effects.ts, ...) it
resolves what it can and stops with the pick in progress, naming those files and the commits left:
resolve them by hand, `git add` them, and run pick.py again with the commits left. A pick in
progress with nothing unresolved is continued first.

Python, not shell: a CRLF checkout breaks a shell script.

Keeping both sides isn't always enough. After every run, before starting a verify:
`npx tsc -p tsconfig.tests.json --noEmit` from engine/, `npx tsc -b` from client/, and read any
doc this flags as merged by "wordsu": two sentences inserted at one spot can interleave.
"""
import os
import re
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
    "engine/src/test/oracle-parse.test.ts": "blocks",
    "client/src/builder/manualChecks.ts": "blocks",
}
TEST = "engine/src/test/oracle-parse.test.ts"


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, errors="replace")


def fix(path, mode):
    return subprocess.run([sys.executable, FIX, mode, path]).returncode == 0


def resolve():
    """Resolve every routine conflict; return the files left for a person."""
    left = []
    for path in git("diff", "--name-only", "--diff-filter=U").stdout.split("\n"):
        if not path:
            continue
        mode = MODES.get(path)
        if mode is None:
            left.append(path)
        elif fix(path, mode):
            git("add", path)
        elif mode == "words" and fix(path, "wordsu"):
            print(f"  READ THIS: {path} kept both sides of a word conflict; check the sentences read")
            git("add", path)
        else:
            left.append(path)
    return left


def finish(commit, rest):
    left = resolve()
    if left:
        print(f"{commit}: STOP, resolve by hand and `git add`: {' '.join(left)}")
        sys.exit(f"then run: pick.py {' '.join(rest)}" if rest else "then run: pick.py")
    if git("-c", "core.editor=true", "cherry-pick", "--continue").returncode != 0:
        sys.exit(f"{commit}: STOP, continue failed")
    print(commit, "resolved")


commits = sys.argv[1:]
if os.path.exists(git("rev-parse", "--git-path", "CHERRY_PICK_HEAD").stdout.strip()):
    finish("the pick in progress", commits)
for i, commit in enumerate(commits):
    if git("cherry-pick", commit).returncode == 0:
        print(commit, "clean")
        continue
    finish(commit, commits[i + 1 :])

if subprocess.run(["node", "--check", "engine/scripts/oracle-parse.mjs"]).returncode == 0:
    print("parser parses")
data = open("engine/src/game.ts", "rb").read()
print("game.ts crlf", data.count(b"\r\n"), "lf", data.count(b"\n"), "nul", data.count(b"\0"))
for path in (TEST, "client/src/builder/manualChecks.ts"):
    text = open(path, "rb").read()
    if b"<<<<<<<" in text:
        print(f"WARNING: {path} holds conflict markers")
text = open(TEST, "rb").read().replace(b"\r\n", b"\n")
for m in re.finditer(rb"^describe\(", text, re.M):
    if not text[: m.start()].rstrip().endswith(b"\n});") and text.count(b"\ndescribe(", 0, m.start()) > 0:
        line = text.count(b"\n", 0, m.start()) + 1
        print(f"WARNING: {TEST}: a block before line {line} isn't closed")
