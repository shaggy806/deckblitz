import { defineCard } from "../define.js";

// EDHREC rank 22957.
//
// Depower's reduction; Misleading Motes's owner's choice of top or bottom.

export default defineCard({
  name: "Run Behind",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets an attacking creature.\nTarget creature's owner puts it on their choice of the top or bottom of their library.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", attacking: true }, reduceGeneric: 1 },
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
