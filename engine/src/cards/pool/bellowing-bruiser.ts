import { defineCard } from "../define.js";

// EDHREC rank 20754. Wilds of Eldraine. Adventure: Beat a Path.

export default defineCard({
  name: "Bellowing Bruiser",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste",
  faces: ["Bellowing Bruiser", "Beat a Path"],
  adventure: true,
});
