import { defineCard } from "../define.js";

export default defineCard({
  name: "Collar the Culprit",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature with toughness 4 or greater.",
  targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "gte", n: 4 } } }],
  effect: { kind: "destroy", target: 0 },
});
