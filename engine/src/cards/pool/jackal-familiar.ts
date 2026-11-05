import { defineCard } from "../define.js";

// EDHREC rank 30110.

export default defineCard({
  name: "Jackal Familiar",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal"],
  power: 2,
  toughness: 2,
  text: "This creature can't attack or block alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone", "cant-block-alone"],
      text: "This creature can't attack or block alone.",
    },
  ],
});
