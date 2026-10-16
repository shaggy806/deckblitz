import { defineCard } from "../define.js";

// EDHREC rank 14089. The Lost Caverns of Ixalan.
//
// Ajani's Response's `targetCostReduction`, over a spell on the stack: the
// cost is fixed once its target is chosen (rules 601.2c, 601.2f), {2} less
// when that target is a creature spell.

export default defineCard({
  name: "Out of Air",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets a creature spell.\nCounter target spell.",
  targets: ["spell"],
  targetCostReduction: { filter: { type: "creature" }, reduceGeneric: 2 },
  effect: { kind: "counter", target: 0 },
});
