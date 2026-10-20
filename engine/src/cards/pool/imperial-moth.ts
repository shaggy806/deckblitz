import { defineCard } from "../define.js";

// Befriending the Moths' back face.

export default defineCard({
  name: "Imperial Moth",
  art: "https://cards.scryfall.io/art_crop/back/8/a/8ad44884-ae0d-40ae-87a9-bad043d4e9ad.jpg",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying",
  faces: ["Befriending the Moths", "Imperial Moth"],
  transform: true,
});
