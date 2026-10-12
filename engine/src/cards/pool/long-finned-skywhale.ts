import { defineCard } from "../define.js";

export default defineCard({
  name: "Long-Finned Skywhale",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 4,
  toughness: 3,
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
