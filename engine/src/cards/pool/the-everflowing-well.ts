import { defineCard } from "../define.js";

// EDHREC rank 5286.
//
// Rulings:
//   [2023-11-10] Some descend triggered abilities include intervening "if" clauses. Each of these
//     abilities checks your graveyard at the moment it would trigger to see if it does, and again
//     as it tries to resolve.
const ENTER_TEXT = "When The Everflowing Well enters, mill two cards, then draw two cards.";
const DESCEND_TEXT =
  "Descend 8 — At the beginning of your upkeep, if there are eight or more permanent cards in your graveyard, transform The Everflowing Well.";

export default defineCard({
  name: "The Everflowing Well",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${DESCEND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "cards-in-graveyard", atLeast: 8, filter: { notTypes: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: DESCEND_TEXT,
    },
  ],
  faces: ["The Everflowing Well", "The Myriad Pools"],
  transform: true,
});
