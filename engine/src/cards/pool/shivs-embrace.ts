import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 21192.

export default defineCard({
  name: "Shiv's Embrace",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2 and has flying.\n{R}: Enchanted creature gets +1/+0 until end of turn.",
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
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +2/+2 and has flying.",
    },
  ],
});
