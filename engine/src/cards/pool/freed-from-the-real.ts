import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Only the player who controls Freed from the Real can activate its abilities. This
//     might not be the controller of the enchanted creature.

export default defineCard({
  name: "Freed from the Real",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{U}: Tap enchanted creature.\n{U}: Untap enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "{U}: Tap enchanted creature.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: "{U}: Untap enchanted creature.",
    },
  ],
});
