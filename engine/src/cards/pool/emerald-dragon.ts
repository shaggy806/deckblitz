import { defineCard } from "../define.js";

// EDHREC rank 10254. Its Adventure is Dissonant Wave.
export default defineCard({
  name: "Emerald Dragon",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: "Flying, trample",
  faces: ["Emerald Dragon", "Dissonant Wave"],
  adventure: true,
});
