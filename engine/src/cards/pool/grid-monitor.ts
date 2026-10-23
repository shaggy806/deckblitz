import { defineCard } from "../define.js";

export default defineCard({
  name: "Grid Monitor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 6,
  text: "You can't cast creature spells.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "you", spells: { type: "creature" } },
      text: "You can't cast creature spells.",
    },
  ],
});
