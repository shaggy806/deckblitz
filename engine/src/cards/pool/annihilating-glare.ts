import { defineCard } from "../define.js";

// EDHREC rank 7798.

export default defineCard({
  name: "Annihilating Glare",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, pay {4} or sacrifice an artifact or creature.\nDestroy target creature or planeswalker.",
  additionalCost: {
    options: [
      { text: "Pay {4}", mana: "{4}" },
      {
        text: "Sacrifice an artifact or creature",
        sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
      },
    ],
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "destroy", target: 0 },
});
