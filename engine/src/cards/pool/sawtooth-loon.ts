import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 23179.
//
// Ruling: the creature is chosen as the trigger resolves, not targeted, and
// may be the Loon itself (it must be, if it's the only one).

const GATE = "When this creature enters, return a white or blue creature you control to its owner's hand.";
const DRAW =
  "When this creature enters, draw two cards, then put two cards from your hand on the bottom of your library.";

export default defineCard({
  name: "Sawtooth Loon",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${GATE}\n${DRAW}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a white or blue creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-bottom", leftover: "stay" },
        ],
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
