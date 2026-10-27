import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 25023.
//
// The replacement takes all of a simultaneous damage event at once (`perEvent`, rule 614.5): 6
// combat damage from several attackers is 6 counters, one replacement (the rulings). The
// engine's `prevent` + `then` is Lichenthrope's shape for "put that many counters on it
// instead": the damage is neither dealt nor (since nothing reads a prevention event) observably
// prevented.
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
        prevent: true,
        perEvent: true,
        to: "you",
        then: { kind: "add-counter", target: "source", counter: "depletion", amount: "x" },
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
        amount: { countersOn: "source", counter: "depletion" },
      },
      resolve: null,
      text: "At the beginning of each end step, remove all depletion counters from this enchantment.",
    },
  ],
});
