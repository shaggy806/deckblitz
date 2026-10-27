import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 20312.

export default defineCard({
  name: "Eerie Procession",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Search your library for an Arcane card, reveal that card, put it into your hand, then shuffle.",
  targets: [],
  effect: { kind: "search-library", filter: { subtype: "Arcane" }, destination: "hand", min: 0, max: 1, reveal: true },
});
