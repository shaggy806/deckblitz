import { defineCard } from "../define.js";

// EDHREC rank 5362. Improvise (rule 702.126a) pays the {X}'s generic mana
// too, never the {U}{U}{U}.
export default defineCard({
  name: "Universal Surveillance",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nDraw X cards.",
  targets: [],
  effect: { kind: "draw", amount: "x" },
});
