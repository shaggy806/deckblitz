import { defineCard } from "../define.js";

// EDHREC rank 15228.

export default defineCard({
  name: "Pigment Wrangler",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Sorcerer"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Striking Palette",
});
