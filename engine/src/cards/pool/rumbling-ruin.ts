import { defineCard } from "../define.js";

// EDHREC rank 26189.
//
// The number of +1/+1 counters is counted once, as the trigger resolves (the
// ruling): the `{ amount }` operand is bound to its value then. The set of
// creatures that can't block is a rule for the rest of the turn, so it is
// kept up to date as their power changes, and covers creatures that enter
// later (the ruling; rule 611.2c). With no counters, creatures with power 0
// or less can't block (the ruling).
const TEXT =
  "When this creature enters, count the number of +1/+1 counters on creatures you control. Creatures your opponents control with power less than or equal to that number can't block this turn.";

export default defineCard({
  name: "Rumbling Ruin",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "restrict",
        filter: {
          type: "creature",
          controlledBy: "opponent",
          power: {
            op: "lte",
            n: {
              amount: {
                aggregate: "sum",
                of: { counters: "+1/+1" },
                filter: { type: "creature", controlledBy: "you" },
              },
            },
          },
        },
        restrictions: ["cant-block"],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
