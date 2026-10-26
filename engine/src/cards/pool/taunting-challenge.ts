import { defineCard } from "../define.js";

export default defineCard({
  name: "Taunting Challenge",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "All creatures able to block target creature this turn do so.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
});
