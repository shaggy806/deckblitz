import { defineCard } from "../define.js";

// EDHREC rank 32187.

export default defineCard({
  name: "Gnat Alley Creeper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 1,
  text: "This creature can't be blocked by creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { keyword: "flying" },
      text: "This creature can't be blocked by creatures with flying.",
    },
  ],
});
