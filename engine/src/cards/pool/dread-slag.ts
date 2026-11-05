import { defineCard } from "../define.js";

// EDHREC rank 31318.

export default defineCard({
  name: "Dread Slag",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 9,
  toughness: 9,
  keywords: ["trample"],
  text: "Trample\nThis creature gets -4/-4 for each card in your hand.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, pt: [-4, -4] },
      text: "This creature gets -4/-4 for each card in your hand.",
    },
  ],
});
