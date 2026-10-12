import { defineCard } from "../define.js";

export default defineCard({
  name: "Cheerful Osteomancer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warlock"],
  power: 4,
  toughness: 2,
  text: "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Raise Dead",
});
