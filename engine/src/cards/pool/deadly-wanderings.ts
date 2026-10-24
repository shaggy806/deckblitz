import { defineCard } from "../define.js";

// EDHREC rank 27081.
//
// "Exactly one creature" is at least one and not two. `countsSelf`, because a
// static's `controls` condition otherwise leaves its own permanent out — an
// animated Deadly Wanderings is one of the creatures you control.

const TEXT = "As long as you control exactly one creature, that creature gets +2/+0 and has deathtouch and lifelink.";

export default defineCard({
  name: "Deadly Wanderings",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: {
        kind: "all",
        of: [
          { kind: "controls", filter: { type: "creature" }, atLeast: 1, countsSelf: true },
          { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 2, countsSelf: true } },
        ],
      },
      grantPt: [2, 0],
      grantKeywords: ["deathtouch", "lifelink"],
      text: TEXT,
    },
  ],
});
