import { defineCard } from "../define.js";

export default defineCard({
  name: "Zombie Outlander",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Scout"],
  power: 2,
  toughness: 2,
  text: "Protection from green",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["G"] },
      text: "Protection from green",
    },
  ],
});
