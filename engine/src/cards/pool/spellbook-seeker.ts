import { defineCard } from "../define.js";

export default defineCard({
  name: "Spellbook Seeker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Careful Study",
});
