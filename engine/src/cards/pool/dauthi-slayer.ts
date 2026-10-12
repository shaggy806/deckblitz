import { defineCard } from "../define.js";

export default defineCard({
  name: "Dauthi Slayer",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nThis creature attacks each combat if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
