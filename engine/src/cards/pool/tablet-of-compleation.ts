import { defineCard } from "../define.js";

// EDHREC rank 13343.

const OIL_TEXT = "{T}: Put an oil counter on this artifact.";
const MANA_TEXT = "{T}: Add {C}. Activate only if this artifact has two or more oil counters on it.";
const DRAW_TEXT = "{1}, {T}: Draw a card. Activate only if this artifact has five or more oil counters on it.";

export default defineCard({
  name: "Tablet of Compleation",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${OIL_TEXT}\n${MANA_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: OIL_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      condition: { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 2 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{1}", tap: true },
      condition: { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 5 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
