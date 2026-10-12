import { defineCard } from "../define.js";

// EDHREC rank 12225.

export default defineCard({
  name: "Donatello's Technique",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  sneak: { cost: "{U}" },
  text: "Sneak {U} (You may cast this spell for {U} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nDraw two cards.",
  effect: { kind: "draw", amount: 2 },
});
