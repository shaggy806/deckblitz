import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Outlander",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 2,
  toughness: 2,
  text: "Protection from white",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
