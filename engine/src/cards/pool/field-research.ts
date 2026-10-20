import { defineCard } from "../define.js";

export default defineCard({
  name: "Field Research",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Kicker {2}{U} (You may pay an additional {2}{U} as you cast this spell.)\nDraw two cards. If this spell was kicked, draw three cards instead.",
  effect: { kind: "draw", amount: 2 },
  kicker: { cost: "{2}{U}", effect: { kind: "draw", amount: 3 } },
});
