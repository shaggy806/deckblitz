import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 9331.
//
// Rulings:
//   [2006-02-01] This has a triggered ability when it enters, not a replacement effect, as
//     previously worded.
//
// Quickling's shape: the return is chosen as the trigger resolves — up to one
// untapped Mountain you control — and with none returned this way, the land is
// sacrificed.

const TEXT = "When this land enters, sacrifice it unless you return an untapped Mountain you control to its owner's hand.";

export default defineCard({
  name: "Dormant Volcano",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n${TEXT}\n{T}: Add {C}{R}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {C}{R}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [
          {
            returnToHand: { subtype: "Mountain", tapped: false, controlledBy: "you" },
            text: "Return an untapped Mountain you control to its owner's hand",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
