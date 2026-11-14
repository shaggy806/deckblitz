import { defineCard } from "../define.js";

// EDHREC rank 17121. Every Swamp on the battlefield counts, whoever controls
// it; the lands this makes Swamps (its controller's, on the battlefield only)
// have "{T}: Add {B}" as any Swamp does (rule 305.6).
//
// Rulings:
//   [2025-10-02] Land cards not on the battlefield aren't affected by Swampbenders's second
//     ability.
//   [2025-10-02] Swampbenders's second ability causes each land on the battlefield you control to
//     have the land type Swamp in addition to its other types. Any land that's a Swamp has the
//     ability "{T}: Add {B}." Nothing else changes about those lands, including their names, other
//     subtypes, other abilities, and whether they're legendary, basic, or snow.
const PT_TEXT = "Swampbenders's power and toughness are each equal to the number of Swamps on the battlefield.";
const SWAMP_TEXT = "Lands you control are Swamps in addition to their other types.";

export default defineCard({
  name: "Swampbenders",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid", "Ally"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${SWAMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { subtype: "Swamp" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      addSubtypes: ["Swamp"],
      text: SWAMP_TEXT,
    },
  ],
});
