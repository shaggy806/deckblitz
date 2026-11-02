import { defineCard } from "../define.js";

export default defineCard({
  name: "Selective Memory",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search your library for any number of nonland cards, exile them, then shuffle.",
  targets: [],
  effect: { kind: "search-library", filter: { notTypes: ["land"] }, destination: "exile", min: 0, max: { librarySize: "you" } },
});
