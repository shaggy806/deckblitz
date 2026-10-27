import { defineCard } from "../define.js";

// Planeshift's Lairs: the land returned is chosen on resolution (not a
// target), and returning none sacrifices this land — Faerie Impostor's shape.
const LAIR = "When this land enters, sacrifice it unless you return a non-Lair land you control to its owner's hand.";
const MANA = "{T}: Add {R}, {G}, or {W}.";

export default defineCard({
  name: "Rith's Grove",
  colors: [],
  types: ["land"],
  subtypes: ["Lair"],
  text: `${LAIR}\n${MANA}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G", "W"] }, amount: 1 },
      resolve: null,
      text: MANA,
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
            prompt: "Return a non-Lair land you control to its owner's hand, or sacrifice Rith's Grove",
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
