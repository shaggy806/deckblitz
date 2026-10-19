import { defineCard } from "../define.js";

// The Brothers' War.
const ANTHEM_TEXT = "Other Soldiers you control get +1/+1.";

export default defineCard({
  name: "Yotian Tactician",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  text: ANTHEM_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Soldier", controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
