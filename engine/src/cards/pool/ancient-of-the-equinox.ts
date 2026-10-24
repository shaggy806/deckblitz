import { defineCard } from "../define.js";

// The back face of Autumnal Gloom.

export default defineCard({
  name: "Ancient of the Equinox",
  art: "https://cards.scryfall.io/art_crop/back/d/4/d41b07c8-f0c8-4654-bcc2-00c785c8c628.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 4,
  keywords: ["trample", "hexproof"],
  text: "Trample, hexproof",
  faces: ["Autumnal Gloom", "Ancient of the Equinox"],
  transform: true,
});
