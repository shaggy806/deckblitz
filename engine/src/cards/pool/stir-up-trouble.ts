import { defineCard } from "../define.js";

// EDHREC rank 15971.

export default defineCard({
  name: "Stir Up Trouble",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature or pay {4}.\nDestroy target creature.",
  additionalCost: {
    options: [
      {
        text: "Sacrifice an artifact or creature",
        sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
      },
      { text: "Pay {4}", mana: "{4}" },
    ],
  },
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
