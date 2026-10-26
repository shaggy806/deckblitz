import { defineCard } from "../define.js";

export default defineCard({
  name: "Soaring Hope",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, you gain 3 life.\nEnchanted creature has flying.\n{W}: Put this Aura on top of its owner's library.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "put-on-library", target: "source", position: "top" },
      resolve: null,
      text: "{W}: Put this Aura on top of its owner's library.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this Aura enters, you gain 3 life.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
  ],
});
