import { defineCard } from "../define.js";

export default defineCard({
  name: "Scrapskin Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Drake"],
  power: 2,
  toughness: 3,
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
