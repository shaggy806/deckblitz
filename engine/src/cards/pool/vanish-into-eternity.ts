import { defineCard } from "../define.js";

export default defineCard({
  name: "Vanish into Eternity",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  targetCostIncrease: { filter: { type: "creature" }, increaseGeneric: 3 },
  text: "This spell costs {3} more to cast if it targets a creature.\nExile target nonland permanent.",
  targets: ["nonland-permanent"],
  effect: { kind: "exile", target: 0 },
});
