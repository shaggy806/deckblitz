import { defineCard } from "../define.js";

// "Up to four" may find fewer; with one or two the opponent "must choose them
// to be put into your graveyard" (the ruling), so nothing is asked then. Three
// or four: they pick two, the rest go to hand.
export default defineCard({
  name: "Gifts Ungiven",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Search your library for up to four cards with different names and reveal them. Target opponent chooses two of " +
    "those cards. Put the chosen cards into your graveyard and the rest into your hand. Then shuffle.",
  targets: ["opponent"],
  effect: {
    kind: "search-library",
    filter: {},
    destination: "hand",
    min: 0,
    max: 4,
    reveal: true,
    together: { distinctNames: true },
    instead: { destination: "graveyard", pick: { exactly: 2 }, chooser: { target: 0 } },
  },
});
