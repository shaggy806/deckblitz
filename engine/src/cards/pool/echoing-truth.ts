import { defineCard } from "../define.js";

// Darksteel (DST). EDHREC rank 9882.
//
// One target: the others with its name (rule 201.2a) aren't targeted, so
// protection or hexproof doesn't save them, and they're affected in the same
// event as the target (`CardFilter.sameNameAsTarget`). An illegal target
// means the spell doesn't resolve at all; a face-down target has no name and
// goes alone.

export default defineCard({
  name: "Echoing Truth",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent and all other permanents with the same name as that permanent to their owners' hands.",
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand-all", filter: { sameNameAsTarget: 0 } },
});
