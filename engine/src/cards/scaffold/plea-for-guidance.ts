import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 9443.

export default defineCard({
  name: "Plea for Guidance",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Search your library for up to two enchantment cards, reveal them, put them into your hand, then shuffle.",
  // TODO(scaffold): Search your library for up to two enchantment cards, reveal them, put them into your hand, then shuffle.
});
