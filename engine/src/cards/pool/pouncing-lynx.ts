import { defineCard } from "../define.js";

export default defineCard({
  name: "Pouncing Lynx",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
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
