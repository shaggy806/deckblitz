import { defineCard } from "../define.js";

const TEXT = "Spells you cast cost {1} less to cast for each card with the same name as that spell in your graveyard.";

export default defineCard({
  name: "Locket of Yesterdays",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: {},
        reduceGeneric: { countInGraveyard: { ownedBy: "you" }, sameNameAs: "priced" },
        when: { caster: "you" },
      },
      text: TEXT,
    },
  ],
});
