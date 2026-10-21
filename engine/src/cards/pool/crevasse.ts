import { defineCard } from "../define.js";

// EDHREC rank 31854.

export default defineCard({
  name: "Crevasse",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Creatures with mountainwalk can be blocked as though they didn't have mountainwalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["mountainwalk"], text: "Creatures with mountainwalk can be blocked as though they didn't have mountainwalk." },
  ],
});
