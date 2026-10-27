import { defineCard } from "../define.js";

// EDHREC rank 16690.

export default defineCard({
  name: "Epicenter",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target player sacrifices a land of their choice.\nThreshold — Each player sacrifices all lands they control instead if there are seven or more cards in your graveyard.",
  targets: ["player"],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: { kind: "sacrifice-all", who: "each-player", filter: { type: "land" } },
    else: { kind: "sacrifice", who: "target", filter: { type: "land" }, count: 1 },
  },
});
