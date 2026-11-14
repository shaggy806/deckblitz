import { defineCard } from "../define.js";

// "As though it had flash if X is 3 or less" (`flashIf.xAtMost`): any X at
// sorcery timing; at other times the offer's X stops at 3 (rules 601.2b,
// 601.3b).
export default defineCard({
  name: "Silver Scrutiny",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashIf: { xAtMost: 3 },
  text: "You may cast this spell as though it had flash if X is 3 or less.\nDraw X cards.",
  effect: { kind: "draw", amount: "x" },
});
