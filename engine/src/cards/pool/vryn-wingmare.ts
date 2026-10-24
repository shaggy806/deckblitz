import { defineCard } from "../define.js";

// EDHREC rank 8390.

export default defineCard({
  name: "Vryn Wingmare",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nNoncreature spells cost {1} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { notTypes: ["creature"] },
        increaseGeneric: 1,
      },
      text: "Noncreature spells cost {1} more to cast.",
    },
  ],
});
