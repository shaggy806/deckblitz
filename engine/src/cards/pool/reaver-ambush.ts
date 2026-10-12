import { defineCard } from "../define.js";

export default defineCard({
  name: "Reaver Ambush",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature with power 3 or less.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
  effect: { kind: "exile", target: 0 },
});
