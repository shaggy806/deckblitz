import { defineCard } from "../define.js";

/** Tombstone Stairwell's 2/2 black Zombie with haste named Tombspawn. Never
 * printed as a token (Mirage, 1996). */
export default defineCard({
  name: "Tombspawn",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste",
});
