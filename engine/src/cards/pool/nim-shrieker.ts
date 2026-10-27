import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 28390.

const TEXT = "This creature gets +1/+0 for each artifact you control.";

export default defineCard({
  name: "Nim Shrieker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
