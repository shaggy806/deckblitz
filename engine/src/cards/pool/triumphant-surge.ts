import { defineCard } from "../define.js";

export default defineCard({
  name: "Triumphant Surge",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature with power 4 or greater. You gain 3 life.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
