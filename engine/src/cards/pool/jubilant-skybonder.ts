import { defineCard } from "../define.js";

const QUOTED = "Spells your opponents cast that target this creature cost {2} more to cast.";
const GRANT_TEXT = `Creatures you control with flying have "${QUOTED}"`;

export default defineCard({
  name: "Jubilant Skybonder",
  manaCost: "{1}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", keyword: "flying", controlledBy: "you" } },
      grantsStatic: [
        {
          affects: { scope: "self" },
          targetedBySpellsCost: { payGeneric: 2 },
          text: QUOTED,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
