import { defineCard } from "../define.js";

export default defineCard({
  name: "Foresight",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search your library for three cards, exile them, then shuffle.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: {}, destination: "exile", min: 3, max: 3 },
      { kind: "delayed-trigger", at: { step: "upkeep" }, text: "Draw a card at the beginning of the next turn's upkeep.", effect: { kind: "draw", amount: 1 } },
    ],
  },
});
