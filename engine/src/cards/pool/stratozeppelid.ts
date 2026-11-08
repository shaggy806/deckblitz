import { defineCard } from "../define.js";

export default defineCard({
  name: "Stratozeppelid",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-block", attackers: { not: { keyword: "flying" } } }],
      text: "This creature can block only creatures with flying.",
    },
  ],
});
