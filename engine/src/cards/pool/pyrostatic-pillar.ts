import { defineCard } from "../define.js";

// EDHREC rank 12429.

export default defineCard({
  name: "Pyrostatic Pillar",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever a player casts a spell with mana value 3 or less, this enchantment deals 2 damage to that player.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { manaValue: { op: "lte", n: 3 } } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a player casts a spell with mana value 3 or less, this enchantment deals 2 damage to that player.",
    },
  ],
});
