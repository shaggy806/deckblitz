import { defineCard } from "../define.js";

// EDHREC rank 14949. Return to Ravnica.
//
// Rulings:
//   Returning another creature you control to its owner's hand is optional. You may choose to
//     sacrifice Faerie Impostor, even if you could return a creature.
//
// Quickling's shape: return up to one other creature you control as the
// trigger resolves; if none was returned this way, sacrifice this.

const TEXT = "When this creature enters, sacrifice it unless you return another creature you control to its owner's hand.";

export default defineCard({
  name: "Faerie Impostor",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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
            prompt: "Return another creature you control to its owner's hand, or sacrifice Faerie Impostor",
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
