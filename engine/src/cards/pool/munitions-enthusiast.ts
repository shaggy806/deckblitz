import { defineCard } from "../define.js";

// EDHREC rank 31672.

export default defineCard({
  name: "Munitions Enthusiast",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nWhen this creature dies, it deals 1 damage to any target.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 1 damage to any target.",
    },
  ],
});
