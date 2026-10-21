import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 24820.

const REGEN = "{R}{R}{R}: Regenerate enchanted creature.";

export default defineCard({
  name: "The Brute",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+0.\n${REGEN}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      text: "Enchanted creature gets +1/+0.",
    },
  ],
  activated: [
    {
      cost: { mana: "{R}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: REGEN,
    },
  ],
});
