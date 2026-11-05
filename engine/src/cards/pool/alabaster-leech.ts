import { defineCard } from "../define.js";

// EDHREC rank 24947.

export default defineCard({
  name: "Alabaster Leech",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 1,
  toughness: 3,
  text: "White spells you cast cost {W} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["W"] }, caster: "you", increaseColored: "{W}" },
      text: "White spells you cast cost {W} more to cast.",
    },
  ],
});
