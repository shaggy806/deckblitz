import { defineCard } from "../define.js";

// Eccentric Pestfinder's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Pestfinder makes in exile (722.3c).
export default defineCard({
  name: "Turn Stones",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: 'For each opponent, you create a 1/1 black and green Pest creature token with "When this token dies, you gain 1 life."',
  effect: { kind: "create-token", token: "Pest Token", count: { countPlayers: "each-opponent" } },
});
