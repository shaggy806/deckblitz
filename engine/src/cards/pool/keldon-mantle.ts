import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 29646.

export default defineCard({
  name: "Keldon Mantle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{B}: Regenerate enchanted creature.\n{R}: Enchanted creature gets +1/+0 until end of turn.\n{G}: Enchanted creature gains trample until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{B}: Regenerate enchanted creature.",
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: Enchanted creature gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: "{G}: Enchanted creature gains trample until end of turn.",
    },
  ],
});
