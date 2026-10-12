import { defineCard } from "../define.js";

export default defineCard({
  name: "Reave Soul",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature with power 3 or less.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
  effect: { kind: "destroy", target: 0 },
});
