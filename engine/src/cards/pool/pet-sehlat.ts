import { defineCard } from "../define.js";

// EDHREC rank 32684.

export default defineCard({
  name: "Pet Sehlat",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bear"],
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
