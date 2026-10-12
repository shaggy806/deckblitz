import { defineCard } from "../define.js";

export default defineCard({
  name: "Stand Up for Yourself",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature with power 3 or greater.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 3 } } }],
  effect: { kind: "destroy", target: 0 },
});
