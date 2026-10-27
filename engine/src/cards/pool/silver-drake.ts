import { defineCard } from "../define.js";

// EDHREC rank 30188.
//
// Rulings:
//   [2004-10-04] You choose the creature to return on resolution of the triggered ability. This is
//     not targeted.

export default defineCard({
  name: "Silver Drake",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, return a white or blue creature you control to its owner's hand.",
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
      text: "When this creature enters, return a white or blue creature you control to its owner's hand.",
    },
  ],
});
