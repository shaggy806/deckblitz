import { defineCard } from "../define.js";

// EDHREC rank 14625. Every player's multicolored spells, and only generic
// mana comes off (rule 601.2f).
export default defineCard({
  name: "Urza's Filter",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "Multicolored spells cost {2} less to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { multicolored: true }, reduceGeneric: 2 },
      text: "Multicolored spells cost {2} less to cast.",
    },
  ],
});
