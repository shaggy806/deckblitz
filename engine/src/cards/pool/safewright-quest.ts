import { defineCard } from "../define.js";

// EDHREC rank 17454. Any Forest or Plains card — not only a basic one.

export default defineCard({
  name: "Safewright Quest",
  manaCost: "{G/W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "Search your library for a Forest or Plains card, reveal it, put it into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { subtypes: ["Forest", "Plains"] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
});
