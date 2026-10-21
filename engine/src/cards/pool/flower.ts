import { defineCard } from "../define.js";

const FACES = ["Flower // Flourish", "Flower", "Flourish"];
const FLOWER_TEXT = "Search your library for a basic Forest or Plains card, reveal it, put it into your hand, then shuffle.";

// The left half of Flower // Flourish (see flower-flourish.ts).
export default defineCard({
  name: "Flower",
  manaCost: "{G/W}",
  colors: ["G", "W"],
  types: ["sorcery"],
  text: FLOWER_TEXT,
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", subtypes: ["Forest", "Plains"] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  faces: FACES,
  split: true,
});
