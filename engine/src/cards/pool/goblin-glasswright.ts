import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Glasswright",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Sorcerer"],
  power: 2,
  toughness: 2,
  text: "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Craft with Pride",
});
