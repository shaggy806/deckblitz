import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloud Dragon",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});
