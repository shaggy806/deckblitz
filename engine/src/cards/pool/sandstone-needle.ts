import { defineCard } from "../define.js";

// EDHREC rank 5788.
//
// Gemstone Mine's shape: the sacrifice is part of the mana ability (`also`,
// applied right after the mana, off the stack).
const MANA_TEXT =
  "{T}, Remove a depletion counter from this land: Add {R}{R}. If there are no depletion counters on this land, sacrifice it.";

export default defineCard({
  name: "Sandstone Needle",
  colors: [],
  types: ["land"],
  text: `This land enters tapped with two depletion counters on it.\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "depletion", count: 1 } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 2,
        also: {
          kind: "conditional",
          condition: { kind: "self-counters", counter: "depletion", compare: { op: "eq", n: 0 } },
          then: { kind: "sacrifice-source" },
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "depletion", amount: 2 } },
      text: "This land enters tapped with two depletion counters on it.",
    },
  ],
});
