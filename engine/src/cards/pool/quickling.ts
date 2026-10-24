import { defineCard } from "../define.js";

// EDHREC rank 7747.
//
// Rulings:
//   If you control no other creatures when the enters-the-battlefield ability resolves, you must
//     sacrifice Quickling.
//
// The choice is made as the trigger resolves: return up to one other creature
// you control (Biblioplex Kraken's shape), and if none was returned this way,
// sacrifice Quickling.

const TEXT = "When this creature enters, sacrifice it unless you return another creature you control to its owner's hand.";

export default defineCard({
  name: "Quickling",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 0,
            upTo: 1,
            exceptSource: true,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return another creature you control to its owner's hand, or sacrifice Quickling",
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "returned-to-hand" } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
