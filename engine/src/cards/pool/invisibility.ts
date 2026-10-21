import { defineCard } from "../define.js";

// EDHREC rank 13871. Prowler's Helm's static on an Aura.

const STATIC_TEXT = "Enchanted creature can't be blocked except by Walls.";

export default defineCard({
  name: "Invisibility",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      cantBeBlockedBy: { notSubtypes: ["Wall"] },
      text: STATIC_TEXT,
    },
  ],
});
