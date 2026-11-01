import { defineCard } from "../define.js";

// Urza's Legacy (ULG). Every enchantment at once; each owner arranges their
// own on top of their library (rule 401.4), the active player first.

export default defineCard({
  name: "Harmonic Convergence",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put all enchantments on top of their owners' libraries.",
  effect: { kind: "put-on-libraries", what: { all: { type: "enchantment" } }, position: "top" },
});
