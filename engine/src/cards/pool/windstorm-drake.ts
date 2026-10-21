import { defineCard } from "../define.js";

// Ravnica Allegiance.
const TEXT = "Other creatures you control with flying get +1/+0.";

export default defineCard({
  name: "Windstorm Drake",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", withKeyword: "flying", excludeSelf: true },
      grantPt: [1, 0],
      text: TEXT,
    },
  ],
});
