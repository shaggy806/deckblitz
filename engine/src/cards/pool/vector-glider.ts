import { defineCard } from "../define.js";

// The back face of The Modern Age (NEO).

export default defineCard({
  name: "Vector Glider",
  art: "https://cards.scryfall.io/art_crop/back/e/e/ee60a8e9-3201-4a7e-8aa4-2c5e1042c8a5.jpg",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying",
  faces: ["The Modern Age", "Vector Glider"],
  transform: true,
});
