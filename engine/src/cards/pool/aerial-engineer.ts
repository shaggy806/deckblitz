import { defineCard } from "../define.js";

const TEXT = "As long as you control an artifact, this creature gets +2/+0 and has flying.";

export default defineCard({
  name: "Aerial Engineer",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [2, 0],
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
