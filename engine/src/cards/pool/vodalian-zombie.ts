import { defineCard } from "../define.js";

export default defineCard({
  name: "Vodalian Zombie",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Zombie"],
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
