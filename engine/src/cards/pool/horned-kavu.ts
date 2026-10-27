import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 23782.
//
// Rulings:
//   [2004-10-04] You choose the creature to return on resolution of the triggered ability. This is
//     not targeted.
//
// Keymaster Rogue's shape with the gating colours; it may return itself.

const TEXT = "When this creature enters, return a red or green creature you control to its owner's hand.";

export default defineCard({
  name: "Horned Kavu",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a red or green creature you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
