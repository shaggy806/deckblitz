import { defineCard } from "../define.js";

// EDHREC rank 3802.
//
// The cost is determined before any of it is paid (the ruling), so sacrificing a Cell for its
// mana after that doesn't undo the reduction.

export default defineCard({
  name: "Hour of Revelation",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "This spell costs {3} less to cast if there are ten or more nonland permanents on the battlefield.\nDestroy all nonland permanents.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { notTypes: ["land"] }, atLeast: 10, anyController: true },
    reduceGeneric: 3,
  },
  targets: [],
  effect: { kind: "destroy-all", filter: { notTypes: ["land"] } },
});
