import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] It affects all players, including you.

export default defineCard({
  name: "Sphere of Resistance",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Spells cost {1} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, increaseGeneric: 1 },
      text: "Spells cost {1} more to cast.",
    },
  ],
});
