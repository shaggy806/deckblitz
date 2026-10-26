import { defineCard } from "../define.js";

const COST_TEXT = "Arcane spells you cast cost {1} less to cast.";
const PT_TEXT = "Spirit creatures you control get +1/+1.";

export default defineCard({
  name: "Long-Forgotten Gohei",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${COST_TEXT}\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Arcane" }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
    {
      affects: { scope: "creatures-you-control", subtype: "Spirit" },
      grantPt: [1, 1],
      text: PT_TEXT,
    },
  ],
});
