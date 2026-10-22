import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 9591.

export default defineCard({
  name: "Hymn to Tourach",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards at random.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 2, random: true },
});
