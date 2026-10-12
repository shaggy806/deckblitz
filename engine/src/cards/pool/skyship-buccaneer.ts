import { defineCard } from "../define.js";

export default defineCard({
  name: "Skyship Buccaneer",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nRaid — When this creature enters, if you attacked this turn, draw a card.",
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
