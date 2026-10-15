import { defineCard } from "../define.js";

// EDHREC rank 10941. Stir Up Trouble's shape: the additional cost is one of
// two, chosen and paid as it's cast.

export default defineCard({
  name: "Deadly Precision",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, pay {4} or sacrifice an artifact or creature.\nDestroy target creature.",
  additionalCost: {
    options: [
      { text: "Pay {4}", mana: "{4}" },
      {
        text: "Sacrifice an artifact or creature",
        sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
      },
    ],
  },
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
