import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloud Pirates",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
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
