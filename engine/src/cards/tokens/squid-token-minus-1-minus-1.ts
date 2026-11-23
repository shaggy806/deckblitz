import { defineCard } from "../define.js";

// A -1/-1 blue Squid — Segovian Sword's "For Segovia!" token, which gets the Sword's +2/+2 before
// state-based actions look at it. No token printing of it exists. Named "Squid Token" in the game
// (rule 111.4), through `tokenName`: Chasm Skulker's islandwalk Squid holds the plain key.
export default defineCard({
  name: "Squid Token (-1/-1)",
  tokenName: "Squid Token",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Squid"],
  power: -1,
  toughness: -1,
});
