import { defineCard } from "../define.js";

// EDHREC rank 13927. The 0's count is every loyalty counter on Jaces you
// control, as it's activated (rule 602.5).
const PLUS = "+1: Empower Jace X, where X is the number of Islands you control.";
const WATCH = "Until your next turn, whenever a creature attacks you or a planeswalker you control, it gets -5/-0 until end of turn.";
const MINUS = `−3: ${WATCH}`;
const ZERO =
  "0: Exile all but the bottom card of each opponent's library. Activate only if there are twenty-five or more loyalty counters among Jaces you control.";

export default defineCard({
  name: "Jace, Reality Sculptor",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ZERO}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "empower-jace", amount: { countOf: { subtype: "Island", controlledBy: "you" } } },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "attacks", who: "any", filter: { type: "creature" }, attackingYou: true },
          until: "until-your-next-turn",
        },
        effect: { kind: "modify-pt", target: "trigger-object", power: -5, toughness: 0, duration: "end-of-turn" },
        text: WATCH,
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: { counters: "loyalty" }, filter: { subtype: "Jace", controlledBy: "you" } },
        compare: { op: "gte", n: 25 },
      },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-opponent", allBut: 1 },
      resolve: null,
      text: ZERO,
    },
  ],
});
