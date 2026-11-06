import { defineCard } from "../define.js";

export default defineCard({
  name: "Klingon Strike Force",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["trample", "haste"],
  text: "Trample (This creature can deal excess combat damage to the player it's attacking.)\nHaste (This creature can attack and {T} as soon as it comes under your control.)\nWhen this creature dies, it deals 2 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to each opponent.",
    },
  ],
});
