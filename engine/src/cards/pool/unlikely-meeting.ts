import { defineCard } from "../define.js";

// Twice Upon a Time's Adventure. A Doctor card is any card with the Doctor
// creature type, Time Lord Doctors and changelings alike.
export default defineCard({
  name: "Unlikely Meeting",
  art: "https://cards.scryfall.io/art_crop/back/9/d/9d504a87-f782-4b70-91da-c1944925e86a.jpg",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Search your library for a Doctor card, reveal it, put it into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { subtype: "Doctor" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  faces: ["Twice Upon a Time", "Unlikely Meeting"],
  adventure: true,
});
