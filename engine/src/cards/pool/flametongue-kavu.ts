import { defineCard } from "../define.js";

export default defineCard({
  name: "Flametongue Kavu",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 4,
  toughness: 2,
  text: "When this creature enters, it deals 4 damage to target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to target creature.",
    },
  ],
});
