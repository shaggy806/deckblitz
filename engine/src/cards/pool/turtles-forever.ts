import { defineCard } from "../define.js";

// EDHREC rank 13178.
//
// Rulings:
//   In a casual game, a card you choose from outside the game comes from your personal
//     collection. In a tournament event, a card you choose from outside the game must come from
//     your sideboard. You may look at your sideboard at any time.
//
// Outside the game is the player's sideboard (rule 400.11a; none in a
// Commander game, 903.5e). "Exactly four legendary creature cards" names a
// quality, so the search may find fewer (rule 701.23b): `min: 0`, `max: 4`.
// The opponent's two go to the hand (`instead`, capped at what was found);
// the rest are shuffled into the library (`destination: "library"`), a find
// from outside the game included.

const TEXT =
  "Search your library and/or outside the game for exactly four legendary creature cards you own with different names, then reveal those cards. An opponent chooses two of them. Put the chosen cards into your hand and shuffle the rest into your library.";

export default defineCard({
  name: "Turtles Forever",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "search-library",
    filter: { supertype: "legendary", type: "creature", ownedBy: "you" },
    outside: true,
    together: { distinctNames: true },
    destination: "library",
    min: 0,
    max: 4,
    reveal: true,
    instead: { destination: "hand", pick: { exactly: 2 }, chooser: "an-opponent" },
  },
});
