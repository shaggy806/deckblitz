import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 17094.

export default defineCard({
  name: "Gaea's Embrace",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +3/+3 and has trample.\n{G}: Regenerate enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{G}: Regenerate enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +3/+3 and has trample.",
    },
  ],
});
