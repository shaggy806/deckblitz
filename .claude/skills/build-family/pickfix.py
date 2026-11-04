#!/usr/bin/env python3
"""Resolve a mechanical cherry-pick conflict from the index's three stages.

  pickfix.py union <path>   keep both sides of each conflicting block
  pickfix.py words <path>   three-way merge word by word (one very long line)

Writes bytes as they are, so line endings stay. Exits 1, leaving the file
alone, when a word merge still conflicts.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

mode, path = sys.argv[1], sys.argv[2]


def stage(n):
    return subprocess.run(["git", "show", f":{n}:{path}"], capture_output=True, check=True).stdout


def encode(data):
    tokens = re.findall(rb"\s+|\S+", data)
    return b"\n".join(t.replace(b"\r", b"\x02").replace(b"\n", b"\x01") for t in tokens) + b"\n"


def decode(data):
    return data.replace(b"\n", b"").replace(b"\x01", b"\n").replace(b"\x02", b"\r")


base, ours, theirs = stage(1), stage(2), stage(3)
words = mode in ("words", "wordsu")
if words:
    # Tokens lose their boundaries when joined, so keep whitespace tokens apart.
    base, ours, theirs = encode(base), encode(ours), encode(theirs)

with tempfile.TemporaryDirectory() as d:
    paths = []
    for name, data in (("ours", ours), ("base", base), ("theirs", theirs)):
        p = os.path.join(d, name)
        with open(p, "wb") as f:
            f.write(data)
        paths.append(p)
    args = ["git", "merge-file", "-p"] + (["--union"] if mode != "words" else []) + paths
    r = subprocess.run(args, capture_output=True)

if r.returncode < 0 or r.returncode > 127:
    sys.exit(f"merge-file failed: {r.stderr.decode()[:200]}")
if words and r.returncode != 0:
    print(f"{path}: {r.returncode} word conflicts remain; file left alone")
    text = r.stdout.decode("utf8", "replace")
    for m in re.finditer(r"<<<<<<<.*?>>>>>>>", text, re.S):
        print(m.group(0).replace("\n", " ")[:400])
    sys.exit(1)

out = decode(r.stdout) if words else r.stdout
if mode == "json":
    # Both sides appended to an array: a line ending in a bare string, before another string, takes a comma.
    out = re.sub(rb'"([ \t]*\r?\n[ \t]*")', rb'",\1', out)
    json.loads(out)
with open(path, "wb") as f:
    f.write(out)
print(f"{path}: resolved ({mode}); {len(stage(2))} ours, {len(stage(3))} theirs, {len(out)} now")
