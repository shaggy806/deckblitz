import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 11077.
//
// Rulings:
//   [2004-10-04] If you don't want to unsummon a land, you can play this card then tap it for mana
//     before the enters ability resolves. You may then choose to sacrifice it instead of
//     unsummoning a land.
//
// Crosis's Catacombs' shape (Faerie Impostor's "sacrifice it unless you return").

const TEXT = "When this land enters, sacrifice it unless you return a non-Lair land you control to its owner's hand.";

export default defineCard({
  name: "Darigaaz's Caldera",
  colors: [],
  types: ["land"],
  subtypes: ["Lair"],
  text: `${TEXT}\n{T}: Add {B}, {R}, or {G}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B}, {R}, or {G}.",
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
            filter: { type: "land", controlledBy: "you", notSubtypes: ["Lair"] },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return a non-Lair land you control to its owner's hand, or sacrifice Darigaaz's Caldera",
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
