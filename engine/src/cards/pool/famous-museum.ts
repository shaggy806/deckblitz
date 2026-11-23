import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). The mana ability's amount is read as it
// resolves: one {C}, plus one per art counter (Everflowing Chalice's read).

const DIES_TEXT = "Whenever a creature you control dies, put an art counter on Famous Museum.";
const MANA_TEXT = "{T}: Add {C}, plus an additional {C} for each art counter on Famous Museum.";

export default defineCard({
  name: "Famous Museum",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${DIES_TEXT}\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { sum: [1, { countersOn: "source", counter: "art" }] },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "art", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
