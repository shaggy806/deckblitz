import { defineCard } from "../define.js";

// Legends. EDHREC rank 18016.
//
// Rulings:
//   Because the "search" requires you to find a card with certain characteristics, you don't
//   have to find the card if you don't want to.
//   Can fetch a snow land.
export default defineCard({
  name: "Untamed Wilds",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, put that card onto the battlefield, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "land", supertype: "basic" },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
