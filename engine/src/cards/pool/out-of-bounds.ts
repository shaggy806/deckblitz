import { defineCard } from "../define.js";

// Battlebond. Assist (rule 702.132a): any other player may be asked to help
// pay — the controller of the spell it targets included.
export default defineCard({
  name: "Out of Bounds",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Assist (Another player can pay up to {3} of this spell's cost.)\nCounter target spell.",
  assist: true,
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
