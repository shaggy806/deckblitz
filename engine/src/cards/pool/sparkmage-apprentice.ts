import { defineCard } from "../define.js";

export default defineCard({
  name: "Sparkmage Apprentice",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
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
