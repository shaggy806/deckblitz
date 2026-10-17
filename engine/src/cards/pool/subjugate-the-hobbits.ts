import { defineCard } from "../define.js";

// EDHREC rank 8636.

export default defineCard({
  name: "Subjugate the Hobbits",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Gain control of each noncommander creature with mana value 3 or less.",
  // Every creature, yours included, under one control effect (one timestamp).
  targets: [],
  effect: {
    kind: "gain-control-all",
    filter: { type: "creature", isCommander: false, manaValue: { op: "lte", n: 3 } },
    untilEndOfTurn: false,
  },
});
