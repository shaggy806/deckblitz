import { defineCard } from "../define.js";

// EDHREC rank 19671.

export default defineCard({
  name: "Herald of Torment",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  bestow: "{3}{B}{B}",
  text: "Bestow {3}{B}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nFlying\nAt the beginning of your upkeep, you lose 1 life.\nEnchanted creature gets +3/+3 and has flying.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, you lose 1 life.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +3/+3 and has flying.",
    },
  ],
});
