import { defineCard } from "../define.js";

// Core Set 2021 (M21). EDHREC rank 6374.
//
// Rulings:
//   If Mazemind Tome leaves the battlefield while its triggered ability is on the stack, you can't
//     exile it from the zone it's put into.
//
// "When there are four or more page counters" is a state trigger (rule
// 603.8); "if you do" needs it still on the battlefield to exile.

const SCRY =
  "{T}, Put a page counter on this artifact: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)";
const DRAW = "{2}, {T}, Put a page counter on this artifact: Draw a card.";
const FOUR = "When there are four or more page counters on this artifact, exile it. If you do, you gain 4 life.";

export default defineCard({
  name: "Mazemind Tome",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${SCRY}\n${DRAW}\n${FOUR}`,
  activated: [
    {
      cost: { mana: null, tap: true, addCounter: { kind: "page", count: 1 } },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: SCRY,
    },
    {
      cost: { mana: "{2}", tap: true, addCounter: { kind: "page", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  triggered: [
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "page", compare: { op: "gte", n: 4 } } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: { kind: "sequence", effects: [{ kind: "exile", target: "source" }, { kind: "gain-life", amount: 4 }] },
      },
      resolve: null,
      text: FOUR,
    },
  ],
});
