import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 9221.
//
// Rulings:
//   [2004-10-04] If you don't want to unsummon a land, you can play this card then tap it for mana
//     before the enters ability resolves. You may then choose to sacrifice it instead of
//     unsummoning a land.
//   [2004-10-04] You can return a land that is tapped or untapped.
//
// Faerie Impostor's "sacrifice it unless you return" shape: up to one non-Lair
// land you control, chosen as the trigger resolves (tapped or not); if none
// was returned this way, sacrifice this land.

const TEXT = "When this land enters, sacrifice it unless you return a non-Lair land you control to its owner's hand.";

export default defineCard({
  name: "Crosis's Catacombs",
  colors: [],
  types: ["land"],
  subtypes: ["Lair"],
  text: `${TEXT}\n{T}: Add {U}, {B}, or {R}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U}, {B}, or {R}.",
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
            prompt: "Return a non-Lair land you control to its owner's hand, or sacrifice Crosis's Catacombs",
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
