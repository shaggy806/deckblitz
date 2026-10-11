import { defineCard } from "../define.js";

// EDHREC rank 14837.

const COST_TEXT = "Noncreature spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Iron Lad, Young Avenger",
  manaCost: "{2}{U/R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
});
