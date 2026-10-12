import { defineCard } from "../define.js";

export default defineCard({
  name: "Nebula Dragon",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, it deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 3 damage to any target.",
    },
  ],
});
