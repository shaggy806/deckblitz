import { defineCard } from "../define.js";

// EDHREC rank 31920.

export default defineCard({
  name: "Undertow",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Creatures with islandwalk can be blocked as though they didn't have islandwalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["islandwalk"], text: "Creatures with islandwalk can be blocked as though they didn't have islandwalk." },
  ],
});
