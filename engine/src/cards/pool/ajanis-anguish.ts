import { defineCard } from "../define.js";

export default defineCard({
  name: "Ajani's Anguish",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "When this enchantment enters, it deals X damage to any target.\nCreatures you control have trample.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "When this enchantment enters, it deals X damage to any target.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["trample"],
      text: "Creatures you control have trample.",
    },
  ],
});
