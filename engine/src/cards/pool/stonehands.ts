import { defineCard } from "../define.js";

// EDHREC rank 30388.

export default defineCard({
  name: "Stonehands",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +0/+2.\n{R}: Enchanted creature gets +1/+0 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}: Enchanted creature gets +1/+0 until end of turn.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 2], text: "Enchanted creature gets +0/+2." }],
});
