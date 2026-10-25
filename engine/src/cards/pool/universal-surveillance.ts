import { defineCard } from "../define.js";

// EDHREC rank 5362.

export default defineCard({
  name: "Universal Surveillance",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nDraw X cards.",
  effect: { kind: "draw", amount: "x" },
});
