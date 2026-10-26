import { defineCard } from "../define.js";

// Rulings:
//   This has a triggered ability when it enters, not a replacement effect, as previously worded.
//
// Quickling's shape: as the trigger resolves, return up to one untapped Swamp
// you control; if none was returned this way, sacrifice this land.

const ETB = "When this land enters, sacrifice it unless you return an untapped Swamp you control to its owner's hand.";

export default defineCard({
  name: "Everglades",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n${ETB}\n{T}: Add {C}{B}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "B"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {C}{B}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { subtype: "Swamp", controlledBy: "you", tapped: false },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return an untapped Swamp you control to its owner's hand, or sacrifice Everglades",
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "returned-to-hand" } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: ETB,
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
