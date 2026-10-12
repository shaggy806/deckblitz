import { defineCard } from "../define.js";

export default defineCard({
  name: "Leech Fanatic",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 2,
  text: "During your turn, this creature has lifelink.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["lifelink"],
      text: "During your turn, this creature has lifelink.",
    },
  ],
});
