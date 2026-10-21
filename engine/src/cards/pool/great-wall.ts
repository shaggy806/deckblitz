import { defineCard } from "../define.js";

// EDHREC rank 30850.

export default defineCard({
  name: "Great Wall",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Creatures with plainswalk can be blocked as though they didn't have plainswalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["plainswalk"], text: "Creatures with plainswalk can be blocked as though they didn't have plainswalk." },
  ],
});
