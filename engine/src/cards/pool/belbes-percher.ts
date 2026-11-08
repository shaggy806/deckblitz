import { defineCard } from "../define.js";

export default defineCard({
  name: "Belbe's Percher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
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
