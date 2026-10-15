import { defineCard } from "../define.js";

// EDHREC rank 23317.

export default defineCard({
  name: "Thing Swing",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets a Hero you control.\nTarget creature you control deals damage equal to twice its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  targetCostReduction: { filter: { subtype: "Hero", controlledBy: "you" }, reduceGeneric: 2 },
  // Read as it resolves; with the first target gone it deals nothing.
  effect: { kind: "damage", amount: { product: [{ powerOf: 0 }, 2] }, target: 1, from: { target: 0 } },
});
