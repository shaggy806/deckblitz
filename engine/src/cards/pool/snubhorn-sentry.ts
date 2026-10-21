import { defineCard } from "../define.js";

// EDHREC rank 21728.

export default defineCard({
  name: "Snubhorn Sentry",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 0,
  toughness: 3,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nThis creature gets +3/+0 as long as you have the city's blessing.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [3, 0],
      text: "This creature gets +3/+0 as long as you have the city's blessing.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
