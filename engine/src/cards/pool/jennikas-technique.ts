import { defineCard } from "../define.js";

// EDHREC rank 20553.

export default defineCard({
  name: "Jennika's Technique",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  sneak: { cost: "{R}" },
  text: "Sneak {R} (You may cast this spell for {R} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nJennika's Technique deals 2 damage to each creature.",
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature" } },
});
