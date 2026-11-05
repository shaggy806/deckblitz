import { defineCard } from "../define.js";

export default defineCard({
  name: "Mana Severance",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search your library for any number of land cards, exile them, then shuffle.",
  targets: [],
  effect: { kind: "search-library", filter: { type: "land" }, destination: "exile", min: 0, max: { librarySize: "you" } },
});
