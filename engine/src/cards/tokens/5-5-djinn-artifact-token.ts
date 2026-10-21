import { defineCard } from "../define.js";

/** "A 5/5 colorless Djinn artifact creature token with flying" (Bottle of
 * Suleiman). */
export default defineCard({
  name: "5/5 Djinn Artifact Token",
  tokenName: "Djinn",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying",
});
