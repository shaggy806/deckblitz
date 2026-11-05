import { defineCard } from "../define.js";

// A 1/1 blue and black Faerie Rogue with flying. "Faerie Rogue Token" is the
// black one; the engine keys tokens by name, so this has its own key and gets
// its in-game name (rule 111.4) from `tokenName`.
export default defineCard({
  name: "Blue-Black Faerie Rogue Token",
  tokenName: "Faerie Rogue Token",
  art: "fb01ca03-8784-4f05-a19e-59d12949cf85",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
