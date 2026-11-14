import { defineCard } from "../define.js";

// EDHREC rank 29810. One search of both zones (Ajani's Aid's
// "library-and-graveyard"), its finds one per slot (Krosan Verge's
// `oneEach`): a basic land card and a card named Jiang Yanggu.
export default defineCard({
  name: "Journey for the Elixir",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library and graveyard for a basic land card and a card named Jiang Yanggu, reveal them, put them into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { anyOf: [{ type: "land", supertype: "basic" }, { name: "Jiang Yanggu" }] },
    destination: "hand",
    reveal: true,
    min: 0,
    max: 2,
    zones: "library-and-graveyard",
    together: {
      oneEach: [
        { label: "a basic land card", filter: { type: "land", supertype: "basic" } },
        { label: "a card named Jiang Yanggu", filter: { name: "Jiang Yanggu" } },
      ],
    },
  },
});
