import { defineCard } from "../define.js";

// Darksteel (DST). EDHREC rank 30498.
//
// One target: the others with its name (rule 201.2a) aren't targeted, so
// protection or hexproof doesn't save them, and they're affected in the same
// event as the target (`CardFilter.sameNameAsTarget`). An illegal target
// means the spell doesn't resolve at all; a face-down target has no name and
// goes alone.

export default defineCard({
  name: "Echoing Calm",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target enchantment and all other enchantments with the same name as that enchantment.",
  targets: ["enchantment"],
  effect: { kind: "destroy-all", filter: { type: "enchantment", sameNameAsTarget: 0 } },
});
