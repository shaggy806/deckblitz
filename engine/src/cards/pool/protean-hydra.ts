import { defineCard } from "../define.js";

// EDHREC rank 6684. The last ability triggers once per +1/+1 counter removed,
// for any reason (its rulings) — `counters-removed`'s `perCounter` — and each
// sets up its own delayed trigger for the next end step, on this object only
// (rule 400.7: one that left and came back is a new object).
export default defineCard({
  name: "Protean Hydra",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: "This creature enters with X +1/+1 counters on it.\nIf damage would be dealt to this creature, prevent that damage and remove that many +1/+1 counters from it.\nWhenever a +1/+1 counter is removed from this creature, put two +1/+1 counters on it at the beginning of the next end step.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { prevent: true, then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: "x" }, perEvent: true },
        to: "self",

      },
      text: "If damage would be dealt to this creature, prevent that damage and remove that many +1/+1 counters from it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "+1/+1", perCounter: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        text: "Put two +1/+1 counters on it.",
      },
      resolve: null,
      text: "Whenever a +1/+1 counter is removed from this creature, put two +1/+1 counters on it at the beginning of the next end step.",
    },
  ],
});
