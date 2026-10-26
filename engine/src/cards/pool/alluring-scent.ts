import { defineCard } from "../define.js";

// Portal. EDHREC rank 19890. Lead's shape.
export default defineCard({
  name: "Alluring Scent",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "All creatures able to block target creature this turn do so.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
});
