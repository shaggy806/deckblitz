import { defineCard } from "../define.js";

const TEXT = "Each player who has cast a nonartifact spell this turn can't cast additional nonartifact spells.";

export default defineCard({
  name: "Ethersworn Canonist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", spells: { notTypes: ["artifact"] }, castLimit: 1 },
      text: TEXT,
    },
  ],
});
