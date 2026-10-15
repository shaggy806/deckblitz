import { defineCard } from "../define.js";

export default defineCard({
  name: "Run Over",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets a Mount or Vehicle you control.\nTarget creature you control deals damage equal to its power to target creature an opponent controls.",
  targetCostReduction: { filter: { subtypes: ["Mount", "Vehicle"], controlledBy: "you" }, reduceGeneric: 1 },
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
