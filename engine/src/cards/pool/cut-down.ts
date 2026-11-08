import { defineCard } from "../define.js";

export default defineCard({
  name: "Cut Down",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature with total power and toughness 5 or less.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", totalPowerToughness: { op: "lte", n: 5 } } }],
  effect: { kind: "destroy", target: 0 },
});
