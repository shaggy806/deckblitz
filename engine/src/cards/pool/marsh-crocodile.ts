import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 29804.
//
// Rulings:
//   [2004-10-04] You choose the creature to return on resolution of the triggered ability. This is
//     not targeted.
//   [2004-10-04] This card can return itself to your hand.
//   [2004-10-04] Both triggered abilities trigger at the same time so you can decide which order
//     they go on the stack.

const GATE = "When this creature enters, return a blue or black creature you control to its owner's hand.";
const DISCARD = "When this creature enters, each player discards a card.";

export default defineCard({
  name: "Marsh Crocodile",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 4,
  toughness: 4,
  text: `${GATE}\n${DISCARD}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a blue or black creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
