import { defineCard } from "../define.js";

// The prepare spell of Paradox Shaper, Void Extrapolator and Theorix Metamage
// (rule 722): no card of its own, only ever cast as the copy a prepared one
// makes in exile (722.3c).
export default defineCard({
  name: "Omit Variables",
  manaCost: "{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Mill three cards. (Put the top three cards of your library into your graveyard.)",
  effect: { kind: "mill", target: "you", amount: 3 },
});
