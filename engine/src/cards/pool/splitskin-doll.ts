import { defineCard } from "../define.js";

// EDHREC rank 7564.
//
// Rulings:
//   [2024-09-20] Once Splitskin Doll's ability begins to resolve, players can't take actions in
//     between the time you draw a card and the time you would discard a card. Notably, they can't
//     try to remove creatures you control with power 2 or less to force you to discard.

const ENTER_TEXT =
  "When this creature enters, draw a card. Then discard a card unless you control another creature with power 2 or less.";

// "Another" leaves the Doll itself out (`excludeSelf`); the check is made
// after the draw, in the same resolution.
export default defineCard({
  name: "Splitskin Doll",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Toy"],
  power: 2,
  toughness: 1,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "not",
              of: {
                kind: "controls",
                filter: { type: "creature", power: { op: "lte", n: 2 } },
                atLeast: 1,
                excludeSelf: true,
              },
            },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
