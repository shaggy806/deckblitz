import { defineCard } from "../define.js";

// EDHREC rank 7225.

const DIES_TEXT = "Whenever a creature you control dies, scry 1 and put an oil counter on this artifact.";
const DRAW_TEXT = "{1}, {T}, Remove two oil counters from this artifact: Draw a card.";

export default defineCard({
  name: "Norn's Wellspring",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${DIES_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "oil", count: 2 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
