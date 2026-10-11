import { defineCard } from "../define.js";

// EDHREC rank 8127.

const COST_TEXT = "Noncreature spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Geist of Saint Thalia",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
});
