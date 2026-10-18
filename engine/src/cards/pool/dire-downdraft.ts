import { defineCard } from "../define.js";

// EDHREC rank 17531.
//
// Depower's reduction over an attacking or a tapped creature (`anyOf`);
// Misleading Motes's owner's choice of top or bottom.

export default defineCard({
  name: "Dire Downdraft",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets an attacking or tapped creature.\nTarget creature's owner puts it on their choice of the top or bottom of their library.",
  targets: ["creature"],
  targetCostReduction: {
    filter: { type: "creature", anyOf: [{ attacking: true }, { tapped: true }] },
    reduceGeneric: 1,
  },
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
