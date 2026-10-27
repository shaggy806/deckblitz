import { defineCard } from "../define.js";

// EDHREC rank 26423.

const THRESHOLD_TEXT =
  "Threshold — Other creatures you control get +2/+2 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Silver Seraph",
  manaCost: "{5}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      text: THRESHOLD_TEXT,
    },
  ],
});
