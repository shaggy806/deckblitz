import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 22067. Kindred (formerly tribal) — Giant.
export default defineCard({
  name: "Giant's Ire",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["kindred", "sorcery"],
  subtypes: ["Giant"],
  text: "Giant's Ire deals 4 damage to target player or planeswalker. If you control a Giant, draw a card.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Giant" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
