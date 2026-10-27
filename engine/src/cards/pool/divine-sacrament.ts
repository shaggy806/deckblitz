import { defineCard } from "../define.js";

const ANTHEM_TEXT = "White creatures get +1/+1.";
const THRESHOLD_TEXT =
  "Threshold — White creatures get an additional +1/+1 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Divine Sacrament",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] } },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] } },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      text: THRESHOLD_TEXT,
    },
  ],
});
