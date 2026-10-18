import { defineCard } from "../define.js";

// EDHREC rank 21785.
//
// X counts every permanent you control with an oil counter on it (this one
// included, if it has one), read as the trigger resolves.
const ENTERS_TEXT =
  "When this creature enters, it deals X damage to any target, where X is the number of permanents you control with oil counters on them.";

export default defineCard({
  name: "Urabrask's Anointer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 4,
  toughness: 2,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "damage",
        amount: { countOf: { controlledBy: "you", counters: { kind: "oil", compare: { op: "gte", n: 1 } } } },
        target: 0,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
