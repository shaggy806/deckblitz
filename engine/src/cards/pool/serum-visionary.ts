import { defineCard } from "../define.js";

// EDHREC rank 10760.
const TEXT = "When this creature enters, draw a card, then scry 2.";

export default defineCard({
  name: "Serum Visionary",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
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
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
