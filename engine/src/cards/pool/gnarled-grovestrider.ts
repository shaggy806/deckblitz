import { defineCard } from "../define.js";

/** The back face of Dormant Grove. */
export default defineCard({
  name: "Gnarled Grovestrider",
  art: "https://cards.scryfall.io/art_crop/back/e/7/e7d3012e-1798-4f72-8d9a-b2d16f817502.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 3,
  toughness: 6,
  keywords: ["vigilance"],
  text: "Vigilance\nOther creatures you control have vigilance.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["vigilance"],
      text: "Other creatures you control have vigilance.",
    },
  ],
  faces: ["Dormant Grove", "Gnarled Grovestrider"],
  transform: true,
});
