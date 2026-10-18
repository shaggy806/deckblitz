import { defineCard } from "../define.js";

export default defineCard({
  name: "Belenon War Anthem",
  art: "https://cards.scryfall.io/art_crop/back/4/f/4fb0eb2d-9cb7-4e72-a970-5009b046df2a.jpg",
  colors: ["W"],
  types: ["enchantment"],
  text: "Creatures you control get +1/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 1],
      text: "Creatures you control get +1/+1.",
    },
  ],
  faces: ["Invasion of Belenon", "Belenon War Anthem"],
  transform: true,
});
