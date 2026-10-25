import { defineCard } from "../define.js";

// EDHREC rank 19958.

export default defineCard({
  name: "Insatiable Gorgers",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Berserker"],
  power: 5,
  toughness: 3,
  madness: { cost: "{3}{R}" },
  text: "This creature attacks each combat if able.\nMadness {3}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
