import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 31985.
//
// Rulings:
//   [2004-10-04] You choose the creature to return on resolution of the triggered ability. This is
//     not targeted.
//
// Keymaster Rogue's shape with the gating colours; it may return itself.

const TEXT = "When this creature enters, return a green or white creature you control to its owner's hand.";

export default defineCard({
  name: "Steel Leaf Paladin",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
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
      text: TEXT,
    },
  ],
});
