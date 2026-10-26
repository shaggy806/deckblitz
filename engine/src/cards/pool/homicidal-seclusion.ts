import { defineCard } from "../define.js";

// EDHREC rank 26215.
//
// "Exactly one creature" is at least one and not two, as Deadly Wanderings.
const TEXT = "As long as you control exactly one creature, that creature gets +3/+1 and has lifelink.";

export default defineCard({
  name: "Homicidal Seclusion",
  manaCost: "{4}{B}",
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
      grantPt: [3, 1],
      grantKeywords: ["lifelink"],
      text: TEXT,
    },
  ],
});
