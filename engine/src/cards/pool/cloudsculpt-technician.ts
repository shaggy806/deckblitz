import { defineCard } from "../define.js";

const TEXT = "As long as you control an artifact, this creature gets +1/+0.";

export default defineCard({
  name: "Cloudsculpt Technician",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish", "Artificer"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [1, 0],
      text: TEXT,
    },
  ],
});
