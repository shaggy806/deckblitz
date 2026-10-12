import { defineCard } from "../define.js";

export default defineCard({
  name: "Storm Fleet Spy",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: "Raid — When this creature enters, if you attacked this turn, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, draw a card.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
