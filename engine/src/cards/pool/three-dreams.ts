import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 10072. "Different names" is the
// search's `together.distinctNames` (Uncage the Menagerie's).

export default defineCard({
  name: "Three Dreams",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Search your library for up to three Aura cards with different names, reveal them, put them into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { subtype: "Aura" },
    together: { distinctNames: true },
    destination: "hand",
    min: 0,
    max: 3,
    reveal: true,
  },
});
