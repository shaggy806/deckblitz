import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 24185.

const TEXT = "Whenever a creature you control becomes blocked, this enchantment deals 1 damage to any target.";

export default defineCard({
  name: "Close Quarters",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
