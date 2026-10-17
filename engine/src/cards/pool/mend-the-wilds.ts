import { defineCard } from "../define.js";

// Woodland Acolyte's Adventure. Reclaim's shape, narrowed to permanent cards.
const TEXT =
  "Put target permanent card from your graveyard on top of your library. (Then exile this card. You may cast the creature later from exile.)";

export default defineCard({
  name: "Mend the Wilds",
  art: "https://cards.scryfall.io/art_crop/back/b/9/b9f10623-4783-4773-b9c8-a5a2bcfdb5d9.jpg",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: TEXT,
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
    },
  ],
  effect: { kind: "put-on-library", target: 0, position: "top" },
  faces: ["Woodland Acolyte", "Mend the Wilds"],
  adventure: true,
});
