import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 31166. "4 life, then 4 for each card named Life Burst
// in each graveyard" is one gain of 4 + 4 × that count.

export default defineCard({
  name: "Life Burst",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player gains 4 life, then gains 4 life for each card named Life Burst in each graveyard.",
  targets: ["player"],
  effect: {
    kind: "gain-life",
    amount: { sum: [4, { product: [4, { countInGraveyard: { name: "Life Burst" } }] }] },
    toControllerOfTarget: 0,
  },
});
