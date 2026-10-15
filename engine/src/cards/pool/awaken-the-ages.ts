import { defineCard } from "../define.js";

// Strife Scholar's prepare spell (rule 722): no card of its own, only ever
// cast as the copy a prepared Scholar makes in exile (722.3c).
export default defineCard({
  name: "Awaken the Ages",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Create two 2/2 red and white Spirit creature tokens.",
  effect: { kind: "create-token", token: "Spirit Token (Red-White 2/2)", count: 2 },
});
