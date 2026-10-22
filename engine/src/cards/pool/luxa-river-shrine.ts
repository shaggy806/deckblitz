import { defineCard } from "../define.js";

// EDHREC rank 21580. Amonkhet.

const ONE_TEXT = "{1}, {T}: You gain 1 life. Put a brick counter on this artifact.";
const TWO_TEXT = "{T}: You gain 2 life. Activate only if there are three or more brick counters on this artifact.";

export default defineCard({
  name: "Luxa River Shrine",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ONE_TEXT}\n${TWO_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "add-counter", target: "source", counter: "brick", amount: 1 },
        ],
      },
      resolve: null,
      text: ONE_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      condition: { kind: "self-counters", counter: "brick", compare: { op: "gte", n: 3 } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TWO_TEXT,
    },
  ],
});
