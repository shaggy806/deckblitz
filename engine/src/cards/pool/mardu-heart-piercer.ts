import { defineCard } from "../define.js";

export default defineCard({
  name: "Mardu Heart-Piercer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 2,
  toughness: 3,
  text: "Raid — When this creature enters, if you attacked this turn, this creature deals 2 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, this creature deals 2 damage to any target.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
