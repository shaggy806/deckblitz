import { defineCard } from "../define.js";

export default defineCard({
  name: "Wild Onslaught",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {4} (You may pay an additional {4} as you cast this spell.)\nPut a +1/+1 counter on each creature you control. If this spell was kicked, put two +1/+1 counters on each creature you control instead.",
  effect: {
    kind: "add-counter-all",
    filter: { type: "creature", controlledBy: "you" },
    counter: "+1/+1",
    amount: 1,
  },
  kicker: {
    cost: "{4}",
    effect: {
      kind: "add-counter-all",
      filter: { type: "creature", controlledBy: "you" },
      counter: "+1/+1",
      amount: 2,
    },
  },
});
