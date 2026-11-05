import { defineCard } from "../define.js";

// EDHREC rank 31314.

export default defineCard({
  name: "Trusty Companion",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Hyena"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nThis creature can't attack alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone"],
      text: "This creature can't attack alone.",
    },
  ],
});
