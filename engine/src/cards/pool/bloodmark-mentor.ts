import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodmark Mentor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Red creatures you control have first strike.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"], controlledBy: "you" } },
      grantKeywords: ["first-strike"],
      text: "Red creatures you control have first strike.",
    },
  ],
});
