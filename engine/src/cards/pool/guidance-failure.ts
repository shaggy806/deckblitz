import { defineCard } from "../define.js";

export default defineCard({
  name: "Guidance Failure",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets an attacking creature.\nTarget creature or Spacecraft's owner puts it on their choice of the top or bottom of their library.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] } }],
  targetCostReduction: { filter: { type: "creature", attacking: true }, reduceGeneric: 1 },
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
