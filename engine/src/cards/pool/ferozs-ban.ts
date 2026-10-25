import { defineCard } from "../define.js";

// Homelands. EDHREC rank 21447.
// Every spell with the creature type, whatever its other types (the ruling).
export default defineCard({
  name: "Feroz's Ban",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: "Creature spells cost {2} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, increaseGeneric: 2 },
      text: "Creature spells cost {2} more to cast.",
    },
  ],
});
