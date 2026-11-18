import { defineCard } from "../define.js";

// EDHREC rank 13974. Judgment.
//
// `exchange-zones` of the graveyard and the library (rule 701.12d), then
// `shuffle-library`. The library's cards arrive in the graveyard as one event,
// their owner arranging them where a card reads the order (rule 404.3).
//
// Rulings:
//   [2004-10-04] You can choose the order of the cards being placed into the graveyard.
//   [2004-10-04] This spell works even if your graveyard or library is empty.

export default defineCard({
  name: "Morality Shift",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exchange your graveyard and library. Then shuffle your library.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [{ kind: "exchange-zones", zones: ["graveyard", "library"] }, { kind: "shuffle-library" }],
  },
});
