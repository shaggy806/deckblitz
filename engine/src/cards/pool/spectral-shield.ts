import { defineCard } from "../define.js";

export default defineCard({
  name: "Spectral Shield",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +0/+2 and can't be the target of spells.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      // No quality: every spell, any player's (the ruling: abilities still may).
      hexproofFrom: { spellsOnly: true, anyController: true, notHexproof: true },
      text: "Enchanted creature gets +0/+2 and can't be the target of spells.",
    },
  ],
});
