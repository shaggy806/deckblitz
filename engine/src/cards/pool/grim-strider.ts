import { defineCard } from "../define.js";

// Dissension. A layer-7c bonus scaled by its controller's hand, read live.

const SHRINK = "This creature gets -1/-1 for each card in your hand.";

export default defineCard({
  name: "Grim Strider",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 6,
  toughness: 6,
  text: SHRINK,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, pt: [-1, -1] },
      text: SHRINK,
    },
  ],
});
