import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 30076.

const TEXT = "This creature gets +1/+0 for each artifact you control.";

export default defineCard({
  name: "Nim Lasher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
