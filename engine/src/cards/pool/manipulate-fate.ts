import { defineCard } from "../define.js";

export default defineCard({
  name: "Manipulate Fate",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search your library for three cards, exile them, then shuffle.\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: {}, destination: "exile", min: 3, max: 3 },
      { kind: "draw", amount: 1 },
    ],
  },
});
