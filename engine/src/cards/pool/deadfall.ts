import { defineCard } from "../define.js";

// EDHREC rank 31694.

export default defineCard({
  name: "Deadfall",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Creatures with forestwalk can be blocked as though they didn't have forestwalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["forestwalk"], text: "Creatures with forestwalk can be blocked as though they didn't have forestwalk." },
  ],
});
