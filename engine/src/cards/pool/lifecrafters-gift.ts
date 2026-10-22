import { defineCard } from "../define.js";

// EDHREC rank 16061. The target's counter goes on first, so a creature you
// control that had none gets a second one from the sweep (the rulings).

export default defineCard({
  name: "Lifecrafter's Gift",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature, then put a +1/+1 counter on each creature you control with a +1/+1 counter on it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: 1,
      },
    ],
  },
});
