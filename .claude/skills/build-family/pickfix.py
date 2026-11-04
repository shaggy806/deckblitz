#!/usr/bin/env python3
"""Resolve a mechanical cherry-pick conflict from the index's three stages.

  pickfix.py union <path>   keep both sides of each conflicting block
  pickfix.py words <path>   three-way merge word by word (one very long line)
  pickfix.py wordsu <path>  the same, keeping both sides of a word conflict
  pickfix.py blocks <path>  three-way merge of whole top-level blocks (BLOCKS below)

Writes bytes as they are, so line endings stay. Exits 1, leaving the file
alone, when a word or block merge still conflicts.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

# Files where agents append whole blocks at one spot. A line merge shares the blocks' closing lines
# and drops them; merged as blocks, each side's blocks stay whole.
BLOCKS = {
    "engine/src/test/oracle-parse.test.ts": rb"^describe\(.*?^\}\);[ \t]*\r?\n",
    "client/src/builder/manualChecks.ts": rb"^  preset\(\r?\n.*?^  \),[ \t]*\r?\n",
}


def segments(data, pattern):
    """Split into (key, bytes), each block with whatever precedes it, and the tail after the last."""
    out, seen, at = [], {}, 0
    for m in re.finditer(pattern, data, re.S | re.M):
        lines = m.group(0).split(b"\n")
        # A preset is known by its title, on the line after `preset(`; a describe by its first line.
        name = (lines[1] if lines[0].strip() == b"preset(" else lines[0]).strip()
        seen[name] = seen.get(name, 0) + 1
        out.append(((name, seen[name]), data[at : m.end()]))
        at = m.end()
    return out, data[at:]


def merge3(ours, base, theirs):
    with tempfile.TemporaryDirectory() as d:
        paths = []
        for name, data in (("ours", ours), ("base", base), ("theirs", theirs)):
            p = os.path.join(d, name)
            with open(p, "wb") as f:
                f.write(data)
            paths.append(p)
        return subprocess.run(["git", "merge-file", "-p", *paths], capture_output=True)


def merge_blocks(base, ours, theirs, pattern):
    """Ours in its order, with what theirs changed applied and what theirs added after it. Returns
    (bytes, the keys that couldn't be merged)."""
    base_segs = dict(segments(base, pattern)[0])
    our_list, our_tail = segments(ours, pattern)
    their_list, their_tail = segments(theirs, pattern)
    merged = dict(our_list)
    theirs_keys = {k for k, _ in their_list}
    conflicts = []

    def combine(key, old, mine, new):
        if new == old or mine == new:
            return mine
        if mine == old:
            return new
        r = merge3(mine, old, new)
        if r.returncode != 0:
            conflicts.append(key)
            return mine
        return r.stdout

    for key, seg in their_list:
        if key not in base_segs:
            if key in merged and merged[key] != seg:
                conflicts.append(key)
            elif key not in merged:
                merged[key] = seg
        elif key in merged:
            merged[key] = combine(key, base_segs[key], merged[key], seg)
        elif seg != base_segs[key]:
            conflicts.append(key)
    for key, seg in base_segs.items():
        if key not in theirs_keys and merged.get(key) == seg:
            del merged[key]
    base_tail = segments(base, pattern)[1]
    tail = combine(("tail", 0), base_tail, our_tail, their_tail)
    return b"".join(merged.values()) + tail, conflicts


def stage(n):
    return subprocess.run(["git", "show", f":{n}:{path}"], capture_output=True, check=True).stdout


mode, path = sys.argv[1], sys.argv[2]
if mode == "blocks":
    out, conflicts = merge_blocks(stage(1), stage(2), stage(3), BLOCKS[path])
    if conflicts:
        print(f"{path}: {len(conflicts)} block conflicts remain; file left alone: {conflicts[:5]}")
        sys.exit(1)
    with open(path, "wb") as f:
        f.write(out)
    print(f"{path}: resolved (blocks); {len(stage(2))} ours, {len(stage(3))} theirs, {len(out)} now")
    sys.exit(0)


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
