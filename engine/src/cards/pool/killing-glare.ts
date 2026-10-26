import { defineCard } from "../define.js";

export default defineCard({
  name: "Killing Glare",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature with power X or less.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: "x" } } }],
  effect: { kind: "destroy", target: 0 },
});
