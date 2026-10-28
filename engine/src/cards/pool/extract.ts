import { defineCard } from "../define.js";

// EDHREC rank 16019. "A card", no quality: one must be found while there is
// one (rule 701.23d).

export default defineCard({
  name: "Extract",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search target player's library for a card and exile it. Then that player shuffles.",
  targets: ["player"],
  effect: { kind: "search-library", whose: { target: 0 }, filter: {}, destination: "exile", min: 1, max: 1 },
});
