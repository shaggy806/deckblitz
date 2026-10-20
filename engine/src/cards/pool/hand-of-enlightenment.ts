import { defineCard } from "../define.js";

// Era of Enlightenment's back face.

export default defineCard({
  name: "Hand of Enlightenment",
  art: "https://cards.scryfall.io/art_crop/back/7/4/74f43827-2b9b-4fc9-a6e2-c682dfbf14f7.jpg",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike",
  faces: ["Era of Enlightenment", "Hand of Enlightenment"],
  transform: true,
});
