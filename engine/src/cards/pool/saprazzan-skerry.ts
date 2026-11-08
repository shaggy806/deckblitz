import { defineCard } from "../define.js";

const ENTER_TEXT = "This land enters tapped with two depletion counters on it.";
const MANA_TEXT = "{T}, Remove a depletion counter from this land: Add {U}{U}. If there are no depletion counters on this land, sacrifice it.";

// EDHREC rank 6165. The counter in its cost keeps it out of the auto-payer
// (AUTHORING §15): activated by hand, floating the mana, and the sacrifice is
// part of the ability (rule 605.1a; `add-mana`'s `also`).
export default defineCard({
  name: "Saprazzan Skerry",
  colors: [],
  types: ["land"],
  text: `${ENTER_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "depletion", amount: 2 } },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "depletion", count: 1 } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
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
});
