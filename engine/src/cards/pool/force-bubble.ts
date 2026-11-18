import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 25023.
//
// The damage becomes the counters (`instead: { effect }`, rules 614.1a, 614.6): it is neither
// dealt nor prevented (the first ruling), so damage that can't be prevented (615.12) is replaced
// all the same. 6 combat damage from several attackers is 6 counters (the second ruling).
const REPLACE_TEXT = "If damage would be dealt to you, put that many depletion counters on this enchantment instead.";

export default defineCard({
  name: "Force Bubble",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${REPLACE_TEXT}\nWhen there are four or more depletion counters on this enchantment, sacrifice it.\nAt the beginning of each end step, remove all depletion counters from this enchantment.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { effect: { kind: "add-counter", target: "source", counter: "depletion", amount: "x" } },
        to: "you",
      },
      text: REPLACE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "self-counters", counter: "depletion", compare: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When there are four or more depletion counters on this enchantment, sacrifice it.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "remove-counter",
        target: "source",
        counter: "depletion",
        amount: "all",
      },
      resolve: null,
      text: "At the beginning of each end step, remove all depletion counters from this enchantment.",
    },
  ],
});
