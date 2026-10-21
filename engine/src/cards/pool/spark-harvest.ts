import { defineCard } from "../define.js";

// EDHREC rank 11767. Exactly one of the two additional costs (Eaten Alive's
// shape).

export default defineCard({
  name: "Spark Harvest",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a creature or pay {3}{B}.\nDestroy target creature or planeswalker.",
  additionalCost: {
    options: [
      { text: "Sacrifice a creature", sacrifice: { type: "creature", controlledBy: "you" } },
      { text: "Pay {3}{B}", mana: "{3}{B}" },
    ],
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "destroy", target: 0 },
});
