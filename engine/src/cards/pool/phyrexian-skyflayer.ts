import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian Skyflayer",
  art: "https://cards.scryfall.io/art_crop/back/7/3/73e92389-4bd2-492e-b4d6-d7cb6baedc41.jpg",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Artificer"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: "Flying, haste",
  faces: ["Harried Artisan", "Phyrexian Skyflayer"],
  transform: true,
});
