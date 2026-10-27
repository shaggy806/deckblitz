import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// Mirrodin (MRD). EDHREC rank 9575.

const CDA_TEXT = "Broodstar's power and toughness are each equal to the number of artifacts you control.";

export default defineCard({
  name: "Broodstar",
  manaCost: "{8}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  selfCostReduction: affinity({ type: "artifact" }),
  text: `Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "artifact", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: CDA_TEXT,
    },
  ],
});
