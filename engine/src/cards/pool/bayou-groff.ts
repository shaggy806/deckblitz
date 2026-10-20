import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] You must sacrifice exactly one creature or pay an extra {3} to cast this spell;
//     you can’t cast it without paying one of those costs, and you can’t pay either multiple
//     times.

export default defineCard({
  name: "Bayou Groff",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Dog"],
  power: 5,
  toughness: 4,
  text: "As an additional cost to cast this spell, sacrifice a creature or pay {3}.",
  additionalCost: {
    options: [
      { text: "Sacrifice a creature", sacrifice: { type: "creature", controlledBy: "you" } },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
});
