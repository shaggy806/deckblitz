import { defineCard } from "../define.js";

// EDHREC rank 24900.

export default defineCard({
  name: "Devour in Flames",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  additionalCost: {
    also: {
      text: "Return a land you control to its owner's hand",
      returnToHand: { filter: { type: "land" }, count: 1 },
    },
  },
  text: "As an additional cost to cast this spell, return a land you control to its owner's hand.\nDevour in Flames deals 5 damage to target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 5, target: 0 },
});
