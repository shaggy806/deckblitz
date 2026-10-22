import { defineCard } from "../define.js";

// EDHREC rank 25420.

export default defineCard({
  name: "Armor of Faith",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+1.\n{W}: Enchanted creature gets +0/+1 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 0,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}: Enchanted creature gets +0/+1 until end of turn.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});
