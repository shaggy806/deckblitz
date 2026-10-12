import { defineCard } from "../define.js";

export default defineCard({
  name: "Pillar of Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature with toughness 4 or greater.",
  targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "gte", n: 4 } } }],
  effect: { kind: "exile", target: 0 },
});
