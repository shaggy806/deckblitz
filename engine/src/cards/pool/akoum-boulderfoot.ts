import { defineCard } from "../define.js";

export default defineCard({
  name: "Akoum Boulderfoot",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 5,
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
