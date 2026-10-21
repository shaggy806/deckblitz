import { defineCard } from "../define.js";

// EDHREC rank 11474.

const TEXT = "Whenever you draw your second card each turn, create two 1/1 black Rat creature tokens.";

export default defineCard({
  name: "Mad Ratter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
