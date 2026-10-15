import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 9660. Affinity for Towns (rule 702.41a): {1} less for each Town
// you control.
export default defineCard({
  name: "Travel the Overworld",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Affinity for Towns (This spell costs {1} less to cast for each Town you control.)\nDraw four cards.",
  selfCostReduction: affinity({ subtype: "Town" }),
  targets: [],
  effect: { kind: "draw", amount: 4 },
});
