import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

/** The land back face of Pelakka Predation. */
export default defineCard({
  name: "Pelakka Caverns",
  art: "https://cards.scryfall.io/art_crop/back/e/6/e63f8b20-f45b-4293-9aac-cdc021939be6.jpg",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {B}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [manaTapAbility("B")],
  faces: ["Pelakka Predation", "Pelakka Caverns"],
});
