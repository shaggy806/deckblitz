import { defineCard } from "../define.js";

export default defineCard({
  name: "Festering Evil",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, this enchantment deals 1 damage to each creature and each player.\n{B}{B}, Sacrifice this enchantment: It deals 3 damage to each creature and each player.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 3 },
          { kind: "damage", amount: 3, who: "each-player" },
        ],
      },
      resolve: null,
      text: "{B}{B}, Sacrifice this enchantment: It deals 3 damage to each creature and each player.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, this enchantment deals 1 damage to each creature and each player.",
    },
  ],
});
