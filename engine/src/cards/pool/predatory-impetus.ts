import { defineCard } from "../define.js";

const TEXT =
  "Enchanted creature gets +3/+3, must be blocked if able, and is goaded. (It attacks each combat if able and attacks a player other than you if able.)";

export default defineCard({
  name: "Predatory Impetus",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      restrictions: ["must-be-blocked-if-able"],
      goads: true,
      text: TEXT,
    },
  ],
});
