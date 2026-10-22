import { defineCard } from "../define.js";

// Ice Age. Street Riot's "during your turn" and Mesa Lynx's "during turns
// other than yours", over the creatures you control.

const YOUR_TURN_TEXT = "During your turn, creatures you control get +2/+0.";
const OTHER_TURNS_TEXT = "During turns other than yours, creatures you control get -0/-2.";

export default defineCard({
  name: "Vibrating Sphere",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${YOUR_TURN_TEXT}\n${OTHER_TURNS_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "your-turn" },
      grantPt: [2, 0],
      text: YOUR_TURN_TEXT,
    },
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      grantPt: [0, -2],
      text: OTHER_TURNS_TEXT,
    },
  ],
});
