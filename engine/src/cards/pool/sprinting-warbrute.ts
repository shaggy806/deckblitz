import { defineCard } from "../define.js";

// EDHREC rank 28348.

export default defineCard({
  name: "Sprinting Warbrute",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Berserker"],
  power: 5,
  toughness: 4,
  dash: { cost: "{3}{R}" },
  text: "This creature attacks each combat if able.\nDash {3}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
