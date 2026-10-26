import { defineCard } from "../define.js";

// EDHREC rank 28546. Dragon Mantle's granted pump; the granted ability's
// `source` is the creature that has it.

const PUMP_TEXT = "{1}{R}: This creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Talons of Falkenrath",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\nEnchanted creature has "${PUMP_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}{R}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: `Enchanted creature has "${PUMP_TEXT}"`,
    },
  ],
});
