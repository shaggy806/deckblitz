import { defineCard } from "../define.js";

export default defineCard({
  name: "Adventurous Eater",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 2,
  text: "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Have a Bite",
});
