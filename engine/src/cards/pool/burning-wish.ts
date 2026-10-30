import { defineCard } from "../define.js";

// EDHREC rank 27239. Judgment.
//
// Outside the game is the caster's sideboard (rule 400.11a) — none in a
// Commander game (903.5e), where the wish finds nothing. A card outside the
// game is hidden, so the search may come up empty (701.23b).

export default defineCard({
  name: "Burning Wish",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You may reveal a sorcery card you own from outside the game and put it into your hand. Exile Burning Wish.",
  effect: {
    kind: "search-library",
    filter: { type: "sorcery" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    outside: "only",
  },
  exileOnResolve: true,
});
