import { defineCard } from "../define.js";

export default defineCard({
  name: "Diabolic Revelation",
  manaCost: "{X}{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search your library for up to X cards, put those cards into your hand, then shuffle.",
  targets: [],
  effect: { kind: "search-library", filter: {}, destination: "hand", min: 0, max: "x" },
});
