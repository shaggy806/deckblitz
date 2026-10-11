import { defineCard } from "../define.js";

// The Arkenstone's Adventure (`the-arkenstone.ts`). Time of Need's search.

export default defineCard({
  name: "Seek the Heart",
  art: "https://cards.scryfall.io/art_crop/back/a/5/a56a88ba-fcfa-4b56-bdae-a080b297b871.jpg",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Search your library for a legendary creature card, reveal it, put it into your hand, then shuffle. (Then exile this card. You may cast the artifact later from exile.)",
  effect: {
    kind: "search-library",
    filter: { supertype: "legendary", type: "creature" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  faces: ["The Arkenstone", "Seek the Heart"],
  adventure: true,
});
