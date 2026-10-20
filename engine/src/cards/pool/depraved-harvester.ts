import { defineCard } from "../define.js";

export default defineCard({
  name: "Depraved Harvester",
  art: "https://cards.scryfall.io/art_crop/back/0/e/0ec488de-fded-4df9-97ed-ba46cbacfdbf.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 3,
  keywords: ["lifelink"],
  text: "Lifelink",
  faces: ["Desperate Farmer", "Depraved Harvester"],
  transform: true,
});
