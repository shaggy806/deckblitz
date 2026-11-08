import { defineCard } from "../define.js";

// EDHREC rank 21548.
//
// Each draw is asked about as it would happen: draw it, or skip it — the
// draw replaced by nothing (an empty effect), so a draw from an empty library
// skipped isn't a loss (rule 614.11).
const TEXT = "If you would draw a card, you may skip that draw instead.";

export default defineCard({
  name: "Obstinate Familiar",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: { text: "skip that draw", effect: { kind: "sequence", effects: [] } }, may: true,
      },
      text: TEXT,
    },
  ],
});
