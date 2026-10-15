import { defineCard } from "../define.js";

// EDHREC rank 18173.
//
// Shimmer Dragon's artifact count. `countsSelf` keeps this creature in the
// count should it become an artifact itself.

const PUMP_TEXT = "As long as you control two or more artifacts, this creature gets +2/+0.";

export default defineCard({
  name: "Gaelicat",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 2, countsSelf: true },
      grantPt: [2, 0],
      text: PUMP_TEXT,
    },
  ],
});
