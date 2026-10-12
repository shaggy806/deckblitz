import { defineCard } from "../define.js";

export default defineCard({
  name: "Fire Nation Raider",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 2,
  text: "Raid — When this creature enters, if you attacked this turn, create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, create a Clue token.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
