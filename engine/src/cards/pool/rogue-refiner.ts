import { defineCard } from "../define.js";

// EDHREC rank 11698.

const TEXT = "When this creature enters, draw a card and you get {E}{E} (two energy counters).";

export default defineCard({
  name: "Rogue Refiner",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "get-energy", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
