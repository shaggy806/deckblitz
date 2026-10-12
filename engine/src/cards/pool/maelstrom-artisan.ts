import { defineCard } from "../define.js";

export default defineCard({
  name: "Maelstrom Artisan",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Sorcerer"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Rocket Volley",
});
