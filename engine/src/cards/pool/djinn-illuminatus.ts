import { defineCard } from "../define.js";

const GRANT =
  "Each instant and sorcery spell you cast has replicate. The replicate cost is equal to its mana cost. (When you cast it, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)";

export default defineCard({
  name: "Djinn Illuminatus",
  manaCost: "{5}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `({U/R} can be paid with either {U} or {R}.)\nFlying\n${GRANT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { typesAnyOf: ["instant", "sorcery"] }, keywordValues: [{ keyword: "replicate", cost: "mana-cost" }] },
      text: GRANT,
    },
  ],
});
