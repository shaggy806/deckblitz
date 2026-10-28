import { defineCard } from "../define.js";

// EDHREC rank 1714. Exiled face down: nobody else, its owner included, may
// look at it (the ruling); played by the normal rules, costs and timing.

export default defineCard({
  name: "Praetor's Grasp",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search target opponent's library for a card and exile it face down. Then that player shuffles. You may play that card for as long as it remains exiled.",
  targets: ["opponent"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: {},
    destination: "exile-face-down",
    playable: "while-exiled",
    min: 1,
    max: 1,
  },
});
