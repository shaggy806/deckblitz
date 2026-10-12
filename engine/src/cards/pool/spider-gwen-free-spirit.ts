import { defineCard } from "../define.js";

// EDHREC rank 9420.

// Burning-Tree Vandal's rummage, on City of Brass's "becomes tapped".
const RUMMAGE_TEXT = "Whenever Spider-Gwen becomes tapped, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Spider-Gwen, Free Spirit",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${RUMMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: RUMMAGE_TEXT,
    },
  ],
});
