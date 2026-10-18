import { defineCard } from "../define.js";

// EDHREC rank 24452.
//
// Depower's reduction, narrowed to a nontoken attacker; Misleading Motes's
// owner's choice of top or bottom.

export default defineCard({
  name: "Uneasy Partings",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets an attacking nontoken creature.\nTarget creature's owner puts it on their choice of the top or bottom of their library.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", attacking: true, token: false }, reduceGeneric: 1 },
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
