import { defineCard } from "../define.js";

// Leech Collector's prepare spell (rule 722): no card of its own, only ever
// cast as the copy a prepared Leech Collector makes in exile (722.3c).
export default defineCard({
  name: "Bloodletting",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Each opponent loses 2 life.",
  effect: { kind: "lose-life", amount: 2, who: "each-opponent" },
});
