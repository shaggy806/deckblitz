import { defineCard } from "../define.js";

export default defineCard({
  name: "Gorehorn Raider",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Pirate"],
  power: 4,
  toughness: 4,
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
