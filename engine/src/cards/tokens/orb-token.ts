import { defineCard } from "../define.js";

// An X/X blue Orb with flying — Phantasmal Sphere's token. Its creator sets
// the X with `basePt`. Scryfall lists no printing of it.

export default defineCard({
  name: "Orb Token",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Orb"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying",
});
