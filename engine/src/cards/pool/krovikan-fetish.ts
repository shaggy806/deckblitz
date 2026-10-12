import { defineCard } from "../define.js";

export default defineCard({
  name: "Krovikan Fetish",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, draw a card at the beginning of the next turn's upkeep.\nEnchanted creature gets +1/+1.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
      resolve: null,
      text: "When this Aura enters, draw a card at the beginning of the next turn's upkeep.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});
