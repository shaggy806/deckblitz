import { defineCard } from "../define.js";

// EDHREC rank 19150. Invisibility's evasion plus a granted phasing.

const STATIC_TEXT = "Enchanted creature has phasing and can't be blocked except by Walls.";

export default defineCard({
  name: "Cloak of Invisibility",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT} (It phases in or out before its controller untaps during each of their untap steps. While it's phased out, it's treated as though it doesn't exist.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["phasing"],
      cantBeBlockedBy: { notSubtypes: ["Wall"] },
      text: STATIC_TEXT,
    },
  ],
});
