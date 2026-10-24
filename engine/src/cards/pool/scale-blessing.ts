import { defineCard } from "../define.js";

export default defineCard({
  name: "Scale Blessing",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Bolster 1, then put a +1/+1 counter on each creature you control with a +1/+1 counter on it. (To bolster 1, choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "bolster", amount: 1 },
      {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: 1,
      },
    ],
  },
});
