import { defineCard } from "../define.js";

// EDHREC rank 15315. Thalia, Guardian of Thraben's tax.

export default defineCard({
  name: "Glowrider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: "Noncreature spells cost {1} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, increaseGeneric: 1 },
      text: "Noncreature spells cost {1} more to cast.",
    },
  ],
});
