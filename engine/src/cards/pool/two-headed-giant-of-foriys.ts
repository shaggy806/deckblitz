import { defineCard } from "../define.js";

// EDHREC rank 31504.
//
// `blockAdditional` (rule 509.1a): blocking two, it divides its damage (510.1d).

export default defineCard({
  name: "Two-Headed Giant of Foriys",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nThis creature can block an additional creature each combat.",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: 1,
      text: "This creature can block an additional creature each combat.",
    },
  ],
});
