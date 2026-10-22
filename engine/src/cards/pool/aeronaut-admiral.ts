import { defineCard } from "../define.js";

// EDHREC rank 9049.

const GRANT_TEXT = "Vehicles you control have flying.";

export default defineCard({
  name: "Aeronaut Admiral",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Vehicle", controlledBy: "you" } },
      grantKeywords: ["flying"],
      text: GRANT_TEXT,
    },
  ],
});
