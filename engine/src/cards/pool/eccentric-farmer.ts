import { defineCard } from "../define.js";

// EDHREC rank 12994.
//
// Rulings:
//   [2025-01-24] The land card you return to your hand can be one you just milled or it can be one
//     that was already in your graveyard.
const TEXT =
  "When this creature enters, mill three cards, then you may return a land card from your graveyard to your hand.";

export default defineCard({
  name: "Eccentric Farmer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (To mill three cards, put the top three cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { type: "land" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
