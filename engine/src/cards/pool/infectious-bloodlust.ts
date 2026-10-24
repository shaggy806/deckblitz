import { defineCard } from "../define.js";

// EDHREC rank 29606.

export default defineCard({
  name: "Infectious Bloodlust",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+1, has haste, and attacks each combat if able.\nWhen enchanted creature dies, you may search your library for a card named Infectious Bloodlust, reveal it, put it into your hand, then shuffle.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantKeywords: ["haste"],
      restrictions: ["must-attack"],
      text: "Enchanted creature gets +2/+1, has haste, and attacks each combat if able.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Infectious Bloodlust?",
        effect: {
          kind: "search-library",
          filter: { name: "Infectious Bloodlust" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When enchanted creature dies, you may search your library for a card named Infectious Bloodlust, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
