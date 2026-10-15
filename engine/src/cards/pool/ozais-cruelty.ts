import { defineCard } from "../define.js";

// EDHREC rank 13558. Blightning's shape.

export default defineCard({
  name: "Ozai's Cruelty",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Ozai's Cruelty deals 2 damage to target player. That player discards two cards.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "discard", target: 0, amount: 2 },
    ],
  },
});
