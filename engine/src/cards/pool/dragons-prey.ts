import { defineCard } from "../define.js";

export default defineCard({
  name: "Dragon's Prey",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  targetCostIncrease: { filter: { subtype: "Dragon" }, increaseGeneric: 2 },
  text: "This spell costs {2} more to cast if it targets a Dragon.\nDestroy target creature.",
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
