import { defineCard } from "../define.js";

export default defineCard({
  name: "Pitchburn Devils",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 3,
  toughness: 3,
  text: "When this creature dies, it deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 3 damage to any target.",
    },
  ],
});
