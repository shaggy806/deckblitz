import { defineCard } from "../define.js";

export default defineCard({
  name: "Defeat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature with power 2 or less.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
  effect: { kind: "destroy", target: 0 },
});
