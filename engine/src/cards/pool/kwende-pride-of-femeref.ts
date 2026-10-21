import { defineCard } from "../define.js";

// EDHREC rank 10105.

const GRANT_TEXT = "Creatures you control with first strike have double strike.";

export default defineCard({
  name: "Kwende, Pride of Femeref",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${GRANT_TEXT}`,
  static: [
    {
      // Keyword-scoped (rule 613.8a): matched against the keywords every
      // other effect has granted, so first strike gained later counts too.
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", keyword: "first-strike" } },
      grantKeywords: ["double-strike"],
      text: GRANT_TEXT,
    },
  ],
});
