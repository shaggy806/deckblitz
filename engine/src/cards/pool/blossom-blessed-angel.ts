import { defineCard } from "../define.js";

export default defineCard({
  name: "Blossom-Blessed Angel",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Cleric"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Seed Suture",
});
