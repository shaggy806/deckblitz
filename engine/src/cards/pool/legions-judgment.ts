import { defineCard } from "../define.js";

export default defineCard({
  name: "Legion's Judgment",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target creature with power 4 or greater.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "destroy", target: 0 },
});
