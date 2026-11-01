import { defineCard } from "../define.js";

const COST_TEXT = "Spells your opponents cast that target this creature cost {2} more to cast.";

export default defineCard({
  name: "Boreal Elemental",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: 2 },
      text: COST_TEXT,
    },
  ],
});
