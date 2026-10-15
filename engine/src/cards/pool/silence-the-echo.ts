import { defineCard } from "../define.js";

// EDHREC rank 28153.
//
// A choice of whole additional costs, each its own cast (Eaten Alive's shape);
// "a creature or planeswalker" is one sacrifice whose filter spans both.

export default defineCard({
  name: "Silence the Echo",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a creature or planeswalker or pay {3}.\nDestroy target creature or planeswalker.",
  additionalCost: {
    options: [
      {
        text: "Sacrifice a creature or planeswalker",
        sacrifice: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "you" },
      },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "destroy", target: 0 },
});
