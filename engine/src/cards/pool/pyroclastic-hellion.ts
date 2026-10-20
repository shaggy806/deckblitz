import { defineCard } from "../define.js";

// Ruling: only one land can be returned, so it's 2 damage to each opponent at
// most.

const ETB =
  "When this creature enters, you may return a land you control to its owner's hand. When you do, this creature deals 2 damage to each opponent.";

export default defineCard({
  name: "Pyroclastic Hellion",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 4,
  toughness: 5,
  text: ETB,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "land", controlledBy: "you" },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "You may return a land you control to its owner's hand",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: {
              kind: "reflexive-trigger",
              targets: [],
              effect: { kind: "damage", amount: 2, who: "each-opponent" },
              text: "When you do, this creature deals 2 damage to each opponent.",
            },
          },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
