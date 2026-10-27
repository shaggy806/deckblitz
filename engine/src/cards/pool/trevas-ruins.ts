import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 10515.
//
// Rulings:
//   [2004-10-04] If you don't want to unsummon a land, you can play this card then tap it for mana
//     before the enters ability resolves. You may then choose to sacrifice it instead of
//     unsummoning a land.
//   [2005-08-01] This land is of type "Lair" only; other subtypes have been removed. It is not a
//     basic land.

const LAIR = "When this land enters, sacrifice it unless you return a non-Lair land you control to its owner's hand.";

export default defineCard({
  name: "Treva's Ruins",
  colors: [],
  types: ["land"],
  subtypes: ["Lair"],
  text: `${LAIR}\n{T}: Add {G}, {W}, or {U}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G}, {W}, or {U}.",
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
            prompt: "Return a non-Lair land you control to its owner's hand, or sacrifice Treva's Ruins",
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "returned-to-hand" } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: LAIR,
    },
  ],
});
