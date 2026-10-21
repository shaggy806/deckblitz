import { defineCard } from "../define.js";

// EDHREC rank 31669.

export default defineCard({
  name: "Quagmire",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Creatures with swampwalk can be blocked as though they didn't have swampwalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["swampwalk"], text: "Creatures with swampwalk can be blocked as though they didn't have swampwalk." },
  ],
});
