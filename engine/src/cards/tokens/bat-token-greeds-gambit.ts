import { defineCard } from "../define.js";

// Greed's Gambit's Bat token: a 2/1 black Bat creature token with flying
// (Bat Token is the 1/1).
export default defineCard({
  name: "Bat Token (Greed's Gambit)",
  art: "59f138e5-501d-486f-b9a0-3f37640398a0",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
