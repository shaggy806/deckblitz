import { defineCard } from "../define.js";

// EDHREC rank 30419.

export default defineCard({
  name: "Raging Kronch",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 3,
  text: "This creature can't attack alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone"],
      text: "This creature can't attack alone.",
    },
  ],
});
