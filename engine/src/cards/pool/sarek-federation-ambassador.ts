import { defineCard } from "../define.js";

// EDHREC rank 28448.

const TEXT =
  "Federation — At the beginning of combat on your turn, draw a card for every five creature types among non-Borg creatures you control. If you draw three or more cards this way, put two +1/+1 counters on each creature you control.";

// "A card for every five" is a fifth of the count, rounded down; "if you
// draw three or more cards this way" counts what this resolution drew (a
// replaced draw isn't one).
export default defineCard({
  name: "Sarek, Federation Ambassador",
  manaCost: "{1}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Advisor"],
  power: 0,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "draw",
            amount: {
              half: {
                aggregate: "distinct",
                of: { subtypesOf: "creature" },
                filter: { type: "creature", controlledBy: "you", notSubtypes: ["Borg"] },
              },
              fraction: 5,
              round: "down",
            },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "drawn", atLeast: 3 },
            then: {
              kind: "add-counter-all",
              filter: { type: "creature", controlledBy: "you" },
              counter: "+1/+1",
              amount: 2,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
