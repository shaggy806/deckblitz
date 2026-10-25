import { defineCard } from "../define.js";

// EDHREC rank 13541.
//
// One `destroy-all` over both halves, so the creatures and everything
// attached to them are destroyed at the same time (the ruling).

export default defineCard({
  name: "End Hostilities",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all creatures and all permanents attached to creatures.",
  targets: [],
  effect: {
    kind: "destroy-all",
    filter: { anyOf: [{ type: "creature" }, { attachedTo: { type: "creature" } }] },
  },
});
