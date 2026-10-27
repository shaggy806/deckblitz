import { defineCard } from "../define.js";

// EDHREC rank 30860. Excavating Anurid's threshold static.

const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has first strike.";

export default defineCard({
  name: "Battlewise Aven",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: THRESHOLD_TEXT,
    },
  ],
});
