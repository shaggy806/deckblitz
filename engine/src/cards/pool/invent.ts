import { defineCard } from "../define.js";

const FACES = ["Invert // Invent", "Invert", "Invent"];

// The right half of Invert // Invent (see invert-invent.ts). Axgard Armory's
// "and/or": none, an instant, a sorcery, or one of each (the ruling).
export default defineCard({
  name: "Invent",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Search your library for an instant card and/or a sorcery card, reveal them, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { typesAnyOf: ["instant", "sorcery"] },
    destination: "hand",
    min: 0,
    max: 2,
    reveal: true,
    together: {
      oneEach: [
        { label: "an instant card", filter: { type: "instant" } },
        { label: "a sorcery card", filter: { type: "sorcery" } },
      ],
    },
  },
  faces: FACES,
  split: true,
});
