import { defineCard } from "../define.js";

// EDHREC rank 20997. Depower's reduction, Isolation at Orthanc's tuck. With
// an empty library the creature becomes its top card (the ruling).
export default defineCard({
  name: "Bury in Books",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets an attacking creature.\nPut target creature into its owner's library second from the top.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", attacking: true }, reduceGeneric: 2 },
  effect: { kind: "put-on-library", target: 0, position: { fromTop: 2 } },
});
