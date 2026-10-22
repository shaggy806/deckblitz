import { defineCard } from "../define.js";

// Ice Age depletion land: Steel Dromedary's conditional "doesn't untap",
// Vulshok Factory's mana-plus-counter, and an upkeep counter removal.

const UNTAP_TEXT = "This land doesn't untap during your untap step if it has a depletion counter on it.";
const UPKEEP_TEXT = "At the beginning of your upkeep, remove a depletion counter from this land.";
const MANA_TEXT = "{T}: Add {W} or {U}. Put a depletion counter on this land.";

export default defineCard({
  name: "Land Cap",
  colors: [],
  types: ["land"],
  text: `${UNTAP_TEXT}\n${UPKEEP_TEXT}\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U"] },
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
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "depletion", compare: { op: "gte", n: 1 } },
      doesntUntap: true,
      text: UNTAP_TEXT,
    },
  ],
});
