import { defineCard } from "../define.js";

// EDHREC rank 15911.
//
// Rulings:
//   [2024-07-26] If all of the targets are illegal as Calamitous Tide tries to resolve, it won’t
//     resolve and none of its effects will happen. You won’t draw or discard any cards.

// Water Whip's "return up to two target creatures" (two optional slots, the
// second a different creature, returned as one instruction), then the loot.
// With every chosen target illegal it doesn't resolve (rule 608.2b, the
// ruling); with none chosen it still draws and discards.
export default defineCard({
  name: "Calamitous Tide",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to two target creatures to their owners' hands. Draw two cards, then discard a card.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
});
