import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 16293.

const GRANTED = "{T}: This creature deals 1 damage to any target.";
const TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Hermetic Study",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
