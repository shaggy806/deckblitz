import { defineCard } from "../define.js";

// EDHREC rank 30523.

export default defineCard({
  name: "Spire Winder",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "ascend"],
  text: "Flying\nAscend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nThis creature gets +1/+1 as long as you have the city's blessing.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you have the city's blessing.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
