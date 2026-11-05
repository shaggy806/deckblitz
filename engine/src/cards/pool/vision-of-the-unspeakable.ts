import { defineCard } from "../define.js";

// The back face of Behold the Unspeakable (behold-the-unspeakable.ts).
const PT = "This creature gets +1/+1 for each card in your hand.";

export default defineCard({
  name: "Vision of the Unspeakable",
  art: "https://cards.scryfall.io/art_crop/back/e/4/e4d52701-e0dc-474e-b08f-88147200d210.jpg",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${PT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, pt: [1, 1] },
      text: PT,
    },
  ],
  faces: ["Behold the Unspeakable", "Vision of the Unspeakable"],
  transform: true,
});
