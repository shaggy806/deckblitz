import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloud Sprite",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nThis creature can block only creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});
