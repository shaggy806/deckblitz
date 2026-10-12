import { defineCard } from "../define.js";

export default defineCard({
  name: "Footlight Fiend",
  manaCost: "{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, it deals 1 damage to any target.",
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
