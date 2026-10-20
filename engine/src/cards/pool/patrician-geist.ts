import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Other Spirits you control get +1/+1.";
const COST_TEXT = "Spells you cast from your graveyard cost {1} less to cast.";

export default defineCard({
  name: "Patrician Geist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ANTHEM_TEXT}\n${COST_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtype: "Spirit" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
    {
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", castFrom: "graveyard", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
});
