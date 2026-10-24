import { defineCard } from "../define.js";

// EDHREC rank 23373. Devoid: no colors.

const TEXT = "Whenever you cast a colorless spell, this enchantment deals 1 damage to any target.";

export default defineCard({
  name: "Molten Nursery",
  manaCost: "{2}{R}",
  colors: [],
  types: ["enchantment"],
  text: `Devoid (This card has no color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colorless: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
