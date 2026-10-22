import { defineCard } from "../define.js";

// EDHREC rank 14218.
//
// Rulings:
//   [2017-07-14] If you cast Uncage the Menagerie with X as 0, you'll search your library and
//     shuffle it, but you won't be able to find any cards.
//   [2017-07-14] For cards in your library with {X} in their mana costs, X is considered to be 0.

export default defineCard({
  name: "Uncage the Menagerie",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to X creature cards with different names that each have mana value X, reveal them, put them into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
    together: { distinctNames: true },
    destination: "hand",
    min: 0,
    max: "x",
    reveal: true,
  },
});
