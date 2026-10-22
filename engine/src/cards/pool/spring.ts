import { defineCard } from "../define.js";

// The half of Spring // Mind cast from the hand.
const FACES = ["Spring // Mind", "Spring", "Mind"];

export default defineCard({
  name: "Spring",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
  faces: FACES,
  split: true,
});
