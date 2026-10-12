import { defineCard } from "../define.js";

export default defineCard({
  name: "Fire Imp",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, it deals 2 damage to target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to target creature.",
    },
  ],
});
