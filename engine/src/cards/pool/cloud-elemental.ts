import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloud Elemental",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
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
