import { defineCard } from "../define.js";

// EDHREC rank 3333.
//
// The sacrifice is part of the mana ability (`also`, applied right after the
// mana, off the stack). Only this ability checks the counters: one removed some
// other way leaves the land in play, unable to pay its own cost (the ruling).
const MANA_TEXT =
  "{T}, Remove a mining counter from this land: Add one mana of any color. If there are no mining counters on this land, sacrifice it.";

export default defineCard({
  name: "Gemstone Mine",
  colors: [],
  types: ["land"],
  text: `This land enters with three mining counters on it.\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "mining", count: 1 } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: {
          kind: "conditional",
          condition: { kind: "self-counters", counter: "mining", compare: { op: "eq", n: 0 } },
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
      replacement: { event: "enters-battlefield", counters: { kind: "mining", amount: 3 } },
      text: "This land enters with three mining counters on it.",
    },
  ],
});
