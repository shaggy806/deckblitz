import { defineCard } from "../define.js";

// EDHREC rank 8350.
//
// "You may draw a card. If you do, discard a card" — Stadium Tidalmage's
// shape: the discard only after a card was actually drawn.

const ENTER_TEXT = "Whenever another artifact you control enters, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Rook Turret",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: { kind: "discard", target: "you", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
