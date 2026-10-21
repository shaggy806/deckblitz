import { defineCard } from "../define.js";

// Undergrowth counts creature cards (tokens aren't cards); a card with {X}
// in its cost has X = 0 in the library (rule 107.3b), which the filter's
// mana value reads.
export default defineCard({
  name: "Mausoleum Secrets",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Undergrowth — Search your library for a black card with mana value less than or equal to the number of creature cards in your graveyard, reveal it, put it into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: {
      colors: ["B"],
      manaValue: { op: "lte", n: { amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } } },
    },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
});
