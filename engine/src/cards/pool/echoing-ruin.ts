import { defineCard } from "../define.js";

// Darksteel (DST). EDHREC rank 17207.
//
// One target: the others with its name (rule 201.2a) aren't targeted, so
// protection or hexproof doesn't save them, and they're affected in the same
// event as the target (`CardFilter.sameNameAsTarget`). An illegal target
// means the spell doesn't resolve at all; a face-down target has no name and
// goes alone.

export default defineCard({
  name: "Echoing Ruin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact and all other artifacts with the same name as that artifact.",
  targets: ["artifact"],
  effect: { kind: "destroy-all", filter: { type: "artifact", sameNameAsTarget: 0 } },
});
