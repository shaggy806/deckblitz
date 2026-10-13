import { defineCard } from "../define.js";

// EDHREC rank 6935.
//
// Rulings:
//   [2004-12-01] Sacrificing an artifact isn't optional. If you control an artifact other than
//     Rust Elemental, you must sacrifice it. Otherwise, you must tap Rust Elemental and lose 4
//     life.

export default defineCard({
  name: "Rust Elemental",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, sacrifice another artifact. If you can't, tap this creature and you lose 4 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // Eldrazi Monument's shape: the sacrifice is mandatory, and "if you
      // can't" is that nothing was sacrificed (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1, exceptSource: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                { kind: "lose-life", amount: 4 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice another artifact. If you can't, tap this creature and you lose 4 life.",
    },
  ],
});
