import { defineCard } from "../define.js";

export default defineCard({
  name: "Demonic Tutor",
  // Pinned: Scryfall answers "Demonic Tutor" by name with Emeritus of Woe // Demonic Tutor, whose
  // prepare spell or adventure shares the name.
  art: "a24b4cb6-cebb-428b-8654-74347a6a8d63",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search your library for a card, put that card into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: {},
    destination: "hand",
    // "A card", no quality: one must be found while there is one (701.23d).
    min: 1,
    max: 1,
  },
});
