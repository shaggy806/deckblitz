import { defineCard } from "../define.js";

// EDHREC rank 28879.

export default defineCard({
  name: "Ruby Leech",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nRed spells you cast cost {R} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["R"] }, caster: "you", increaseColored: "{R}" },
      text: "Red spells you cast cost {R} more to cast.",
    },
  ],
});
