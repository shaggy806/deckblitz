import { defineCard } from "../define.js";

// EDHREC rank 8360.

export default defineCard({
  name: "Bladestitched Skaab",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Other Zombies you control get +1/+0.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Zombie", excludeSelf: true },
      grantPt: [1, 0],
      text: "Other Zombies you control get +1/+0.",
    },
  ],
});
