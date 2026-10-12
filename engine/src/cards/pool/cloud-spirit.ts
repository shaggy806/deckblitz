import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloud Spirit",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
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
