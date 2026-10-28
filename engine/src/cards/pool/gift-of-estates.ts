import { defineCard } from "../define.js";

// EDHREC rank 5118. Land Tax's condition and search, as a sorcery: any card
// with the Plains type (its ruling — Tundra too), and nothing at all unless
// some one opponent controls more lands as it resolves.

export default defineCard({
  name: "Gift of Estates",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "If an opponent controls more lands than you, search your library for up to three Plains cards, reveal them, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "opponent-controls-more", filter: { type: "land" } },
    then: { kind: "search-library", filter: { subtype: "Plains" }, destination: "hand", min: 0, max: 3, reveal: true },
  },
});
