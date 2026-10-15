import { defineCard } from "../define.js";

// EDHREC rank 23147.
// "If you do" is gated on Bob actually going back to the hand (Cartographer's
// Hawk's `this-way` `returned-to-hand`): gone from the battlefield in
// response, he isn't returned and nobody drains.

const ALONE_TEXT =
  "Whenever Bob attacks alone, return him to his owner's hand. If you do, each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Bob, Reluctant HYDRA Agent",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Coward", "Villain"],
  power: 2,
  toughness: 2,
  text: ALONE_TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 2, who: "each-opponent" },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
