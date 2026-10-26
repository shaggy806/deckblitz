import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 23108.

const TEXT = "Whenever a creature blocks, this enchantment deals 1 damage to that creature's controller.";

export default defineCard({
  name: "Heat of Battle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
