import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 20964. Alluring Scent's effect.

export default defineCard({
  name: "Bloodscent",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "All creatures able to block target creature this turn do so.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
});
