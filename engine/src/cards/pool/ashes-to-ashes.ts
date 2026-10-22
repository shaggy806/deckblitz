import { defineCard } from "../define.js";

// Rulings:
//   [2009-10-01] If one of the targeted creatures is an illegal target by the time Ashes to Ashes
//     resolves, it still exiles the other one and deals 5 damage to you.
//   [2009-10-01] If both of the targeted creatures are illegal targets by the time Ashes to Ashes
//     resolves, it's countered. It doesn't deal 5 damage to you.

export default defineCard({
  name: "Ashes to Ashes",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile two target nonartifact creatures. Ashes to Ashes deals 5 damage to you.",
  targets: ["nonartifact-creature", { kind: "other", of: "nonartifact-creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0 },
          { kind: "exile", target: 1 },
        ],
      },
      { kind: "damage", amount: 5, who: "you" },
    ],
  },
});
