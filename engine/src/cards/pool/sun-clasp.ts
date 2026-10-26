import { defineCard } from "../define.js";

export default defineCard({
  name: "Sun Clasp",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+3.\n{W}: Return enchanted creature to its owner's hand.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "attached" },
      resolve: null,
      text: "{W}: Return enchanted creature to its owner's hand.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 3], text: "Enchanted creature gets +1/+3." }],
});
