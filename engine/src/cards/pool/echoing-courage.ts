import { defineCard } from "../define.js";

// Darksteel (DST). EDHREC rank 12733.
//
// One target: the others with its name (rule 201.2a) aren't targeted, so
// protection or hexproof doesn't save them, and they're affected in the same
// event as the target (`CardFilter.sameNameAsTarget`). An illegal target
// means the spell doesn't resolve at all; a face-down target has no name and
// goes alone.

export default defineCard({
  name: "Echoing Courage",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature and all other creatures with the same name as that creature get +2/+2 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", sameNameAsTarget: 0 },
    power: 2,
    toughness: 2,
    duration: "end-of-turn",
  },
});
