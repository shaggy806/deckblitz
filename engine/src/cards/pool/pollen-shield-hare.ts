import { defineCard } from "../define.js";

// EDHREC rank 7724. Wilds of Eldraine. Adventure: Hare Raising.

export default defineCard({
  name: "Pollen-Shield Hare",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rabbit"],
  power: 2,
  toughness: 2,
  text: "Creature tokens you control get +1/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control", tokenOnly: true },
      grantPt: [1, 1],
      text: "Creature tokens you control get +1/+1.",
    },
  ],
  faces: ["Pollen-Shield Hare", "Hare Raising"],
  adventure: true,
});
