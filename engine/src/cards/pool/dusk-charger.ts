import { defineCard } from "../define.js";

// EDHREC rank 28636.

export default defineCard({
  name: "Dusk Charger",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 3,
  toughness: 3,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nThis creature gets +2/+2 as long as you have the city's blessing.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [2, 2],
      text: "This creature gets +2/+2 as long as you have the city's blessing.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
