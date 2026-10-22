import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 30327.

const UNTAP_TEXT = "This land doesn't untap during your untap step if it has a depletion counter on it.";
const UPKEEP_TEXT = "At the beginning of your upkeep, remove a depletion counter from this land.";
const MANA_TEXT = "{T}: Add {R} or {G}. Put a depletion counter on this land.";

export default defineCard({
  name: "Timberline Ridge",
  colors: [],
  types: ["land"],
  text: `${UNTAP_TEXT}\n${UPKEEP_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "depletion", compare: { op: "gte", n: 1 } },
      doesntUntap: true,
      text: UNTAP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["R", "G"] },
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "depletion", amount: 1 },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "depletion", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
