import { defineCard } from "../define.js";

// EDHREC rank 29995. Whether it's attacking or blocking is checked as the
// spell resolves (its ruling); neither, and it does nothing. The creatures
// it's blocking are the ones it's blocking then (rule 608.2h): each gets a
// prevention of its own, as does the blocker, lasting this combat (rule
// 511.2) — a creature that stops blocking or being blocked keeps its shield.

const TEXT =
  "Choose target creature. If it's attacking, it can't be blocked this turn. If it's blocking, prevent all combat " +
  "damage that would be dealt this combat by it and each creature it's blocking.";

export default defineCard({
  name: "Sewers of Estark",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { attacking: true } },
        then: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { blocking: true } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "damage-rule", by: { target: 0 }, combat: true, duration: "until-end-of-combat" },
            {
              kind: "for-each-permanent",
              filter: { type: "creature", blockingRelation: { relation: "blocked-by", of: 0 } },
              as: 1,
              effect: { kind: "damage-rule", by: { target: 1 }, combat: true, duration: "until-end-of-combat" },
            },
          ],
        },
      },
    ],
  },
});
