import { defineCard } from "../define.js";

// A 1/1 green and blue Bird with flying (The Bird Champion). No token printing
// of it in the Oracle snapshot.
export default defineCard({
  name: "Green-Blue Bird Token (Flying)",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
