import { defineCard } from "../define.js";

// EDHREC rank 8295. The creature half of Smitten Swordmaster // Curry Favor
// (an Adventure, rule 715); the sorcery half is `curry-favor.ts`.

export default defineCard({
  name: "Smitten Swordmaster",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink",
  faces: ["Smitten Swordmaster", "Curry Favor"],
  adventure: true,
});
