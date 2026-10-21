import { defineCard } from "../define.js";

// EDHREC rank 22811.

export default defineCard({
  name: "Storm Fleet Swashbuckler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nThis creature has double strike as long as you have the city's blessing.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["double-strike"],
      text: "This creature has double strike as long as you have the city's blessing.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
