import { defineCard } from "../define.js";

// EDHREC rank 14824.

export default defineCard({
  name: "Study the Classics",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature, then double the number of +1/+1 counters on it. You gain life equal to the number of +1/+1 counters on that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "double-counters", target: 0, counter: "+1/+1" },
      { kind: "gain-life", amount: { countersOn: 0, counter: "+1/+1" } },
    ],
  },
});
