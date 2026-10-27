import { defineCard } from "../define.js";

// EDHREC rank 29249.

const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +2/+2 and can't block.";

export default defineCard({
  name: "Childhood Horror",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      restrictions: ["cant-block"],
      text: THRESHOLD_TEXT,
    },
  ],
});
