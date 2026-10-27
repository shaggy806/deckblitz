import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 23464.

const TEXT = "This creature gets +1/+1 for each untapped permanent your opponents control.";

export default defineCard({
  name: "Copperhoof Vorrac",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar", "Beast"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { controlledBy: "opponent", tapped: false }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
