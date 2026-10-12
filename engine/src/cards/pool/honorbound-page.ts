import { defineCard } from "../define.js";

export default defineCard({
  name: "Honorbound Page",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Forum's Favor",
});
