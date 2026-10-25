import { defineCard } from "../define.js";

// EDHREC rank 9443.

export default defineCard({
  name: "Plea for Guidance",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Search your library for up to two enchantment cards, reveal them, put them into your hand, then shuffle.",
  effect: { kind: "search-library", filter: { type: "enchantment" }, destination: "hand", min: 0, max: 2, reveal: true },
});
