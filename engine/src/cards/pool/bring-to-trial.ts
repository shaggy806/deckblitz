import { defineCard } from "../define.js";

export default defineCard({
  name: "Bring to Trial",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature with power 4 or greater.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "exile", target: 0 },
});
