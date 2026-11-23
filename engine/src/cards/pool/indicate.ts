import { defineCard } from "../define.js";

// A playtest card (Mystery Booster 2): it targets a permanent and does
// nothing else (the rulings).

export default defineCard({
  name: "Indicate",
  manaCost: "{0}",
  colors: [],
  types: ["sorcery"],
  text: "Target permanent.",
  targets: ["permanent"],
  effect: { kind: "sequence", effects: [] },
});
