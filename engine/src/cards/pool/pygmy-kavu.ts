import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 11896.

const TEXT = "When this creature enters, draw a card for each black creature your opponents control.";

export default defineCard({
  name: "Pygmy Kavu",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { type: "creature", colors: ["B"], controlledBy: "opponent" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
