import { defineCard } from "../define.js";

// A 2/2 blue Elemental creature token with flying (Wand of the Elements).
// Scryfall lists no printing of it.

export default defineCard({
  name: "2/2 Blue Elemental Token (Flying)",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying",
});
