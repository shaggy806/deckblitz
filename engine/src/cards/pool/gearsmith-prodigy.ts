import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+0 as long as you control an artifact.";

export default defineCard({
  name: "Gearsmith Prodigy",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 0],
      text: TEXT,
    },
  ],
});
