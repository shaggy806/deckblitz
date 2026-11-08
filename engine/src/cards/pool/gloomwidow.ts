import { defineCard } from "../define.js";

export default defineCard({
  name: "Gloomwidow",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nThis creature can block only creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-block", attackers: { not: { keyword: "flying" } } }],
      text: "This creature can block only creatures with flying.",
    },
  ],
});
