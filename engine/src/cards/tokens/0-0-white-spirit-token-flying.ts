import { defineCard } from "../define.js";

// A 0/0 white Spirit with flying (Imaginary Friends). No token printing of it
// in the Oracle snapshot.
export default defineCard({
  name: "0/0 White Spirit Token (Flying)",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying",
});
