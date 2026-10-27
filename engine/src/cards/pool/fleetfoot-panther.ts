import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 15091.
//
// Rulings:
//   [2004-10-04] You choose the creature to return on resolution of the triggered ability. This is
//     not targeted.

const GATE = "When this creature enters, return a green or white creature you control to its owner's hand.";

export default defineCard({
  name: "Fleetfoot Panther",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${GATE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a green or white creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
  ],
});
