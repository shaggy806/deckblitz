import { defineCard } from "../define.js";

// A 1/1 white Insect with flying (17-Year Cicadas). No token printing of it
// in the Oracle snapshot.
export default defineCard({
  name: "White Insect Token (Flying)",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
