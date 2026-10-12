import { defineCard } from "../define.js";

export default defineCard({
  name: "Landscape Painter",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Vibrant Idea",
});
