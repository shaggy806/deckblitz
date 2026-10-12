import { defineCard } from "../define.js";

export default defineCard({
  name: "Skeleton Archer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Archer"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, it deals 1 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 1 damage to any target.",
    },
  ],
});
