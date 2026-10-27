<!-- The need-keys plan's key merge (docs/plans/need-keys-after-the-walk.md, Phase 1 step 3).
     Give the agent this text with {{BRIEF}} naming a file of `cards:needs -- --brief <family>`'s
     output (every page) and {{CANDIDATES}} one of `--audit`'s merge candidates for that family.
     Settled by the Phase 0.5 trial: run it on Haiku. -->

You are cleaning up the vocabulary of "need keys" for a Magic: The Gathering rules engine. Each
key names an engine feature that some unimplemented cards are waiting on. People wrote the keys
card by card, so several keys often name the same feature in different words.

{{BRIEF}} is one family of keys. Each open key has its card count, its description and up to two
quoted reasons why a card was blocked. The family's built keys are listed at the end, with what
each does. {{CANDIDATES}} lists pairs a script flagged because their names look alike. Use them
as hints only: many flagged pairs are different features.

Return two things:

1. **aliases**: `"old-key": "kept-key"` when building the kept key, exactly as described, would
   let every card of the old key be written with no more engine work. Both keys then mean one
   feature. Keep the key with more cards, or the clearer name. An alias onto a **built** key says
   the old key's cards are no longer blocked, so make one only when the built key's description
   plainly covers every quoted reason.
2. **groups**: keys that stay separate features but that one general implementation would cover.
   For example, three "can't block unless …" keys are one static with a condition. Give the keys
   and the general shape in one line. A key belongs to at most one group. An aliased old key is
   not listed in a group; its kept key is.

Be strict about aliases. A wrong alias hides a real need behind another key, so its cards never
get built. When two keys only overlap, or one is a narrower case that needs something extra,
that is a group, not an alias. Read only the two files named above and judge from their text
alone: open nothing else, run nothing, and edit no file.

Your final message is only a JSON object, and nothing else (no prose, no code fence):

{"aliases": {"<old-key>": "<kept-key>"}, "groups": [{"keys": ["<key>", "<key>"], "shape": "<one line>"}]}
