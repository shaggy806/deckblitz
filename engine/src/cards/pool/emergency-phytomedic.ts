import { defineCard } from "../define.js";

export default defineCard({
  name: "Emergency Phytomedic",
  manaCost: "{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Dryad", "Cleric"],
  power: 1,
  toughness: 1,
  text: "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Seed Suture",
});
