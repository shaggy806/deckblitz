import { defineCard } from "../define.js";

// EDHREC rank 24230. Ixalan. Raid over Stadium Tidalmage's "you may draw a
// card. If you do, discard a card."

export default defineCard({
  name: "Shipwreck Looter",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 1,
  text: "Raid — When this creature enters, if you attacked this turn, you may draw a card. If you do, discard a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
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
      text: "Raid — When this creature enters, if you attacked this turn, you may draw a card. If you do, discard a card.",
    },
  ],
});
