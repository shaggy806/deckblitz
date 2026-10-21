import { defineCard } from "../define.js";

// EDHREC rank 19631.

export default defineCard({
  name: "Skymarcher Aspirant",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nThis creature has flying as long as you have the city's blessing.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["flying"],
      text: "This creature has flying as long as you have the city's blessing.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
