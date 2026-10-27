import { defineCard } from "../define.js";

// EDHREC rank 28040. Dragon Mantle's shape; the granted ability's `source` is the creature.

const PUMP_TEXT = "{B}: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Midnight Covenant",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${PUMP_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: `Enchanted creature has "${PUMP_TEXT}"`,
    },
  ],
});
