import { defineCard } from "../define.js";

export default defineCard({
  name: "Ritual of Steel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, draw a card at the beginning of the next turn's upkeep.\nEnchanted creature gets +0/+2.",
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
  static: [{ affects: { scope: "attached" }, grantPt: [0, 2], text: "Enchanted creature gets +0/+2." }],
});
