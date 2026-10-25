import { defineCard } from "../define.js";

// EDHREC rank 18506. The player is the target, not the creatures: they choose
// which two as it resolves (the rulings).

export default defineCard({
  name: "Dead Drop",
  manaCost: "{9}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\n" +
    "Target player sacrifices two creatures of their choice.",
  delve: true,
  targets: ["player"],
  effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 2 },
});
