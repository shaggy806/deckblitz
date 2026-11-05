import { defineCard } from "../define.js";

// EDHREC rank 3547.

export default defineCard({
  name: "Eidolon of Rhetoric",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 4,
  text: "Each player can't cast more than one spell each turn.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", spells: true, castLimit: 1 },
      text: "Each player can't cast more than one spell each turn.",
    },
  ],
});
