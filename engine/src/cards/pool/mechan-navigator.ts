import { defineCard } from "../define.js";

// EDHREC rank 14602. Silvergill Peddler's shape.

const TAP_TEXT = "Whenever this creature becomes tapped, draw a card, then discard a card.";

export default defineCard({
  name: "Mechan Navigator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Pilot"],
  power: 2,
  toughness: 1,
  text: TAP_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
