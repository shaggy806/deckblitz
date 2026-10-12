import { defineCard } from "../define.js";

export default defineCard({
  name: "Fresh-Faced Recruit",
  manaCost: "{1}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "During your turn, this creature has first strike.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
  ],
});
